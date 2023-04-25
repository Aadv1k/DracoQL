import * as Lexer from "./types/lexer";
import * as AST from "./types/ast";
import { GET, POST } from "./lib/fetch";
import fs from "node:fs";
import path from "node:path";

import fetch from "node-fetch";

import {
  DQLSyntaxError,
  DQLNetworkError,
  DQLReferenceError,
  DQLMissingBody,
} from "./Exceptions";
import HTML from "node-html-parser";

const ERR_EXIT_CODE = 1;

export default class DQLInterpreter {
  ASTDocument: AST.ASTDocument;
  NS: {
    [key: string]: {
      type: string;
      value: string;
    } | null;
  };

  constructor(ASTDocument: AST.ASTDocument) {
    this.ASTDocument = ASTDocument;
    this.NS = {};
  }

  async evalFetch(
    node: AST.FetchExpression,
    orNode?: AST.OrExpression
  ): Promise<AST.GeneralType> {

    let response: any;

    if (node?.meta?.method === "POST") {
      if (!node.meta?.body?.value)
        throw new DQLMissingBody(
          "FETCH with POST expected a BODY, found none",
          node.location.row,
          node.location.col
        );
      response = await POST(
        node.url,
        node.meta.body.value,
        node.meta?.headers
      ).catch((_a: string) => {
        throw new DQLNetworkError("unable to parse FETCH expression");
      });
    } else {

      response = await fetch(node.url, {
        method: "GET",
        headers: node.meta?.headers
      }).catch((_a: string) => {
        throw new DQLNetworkError("unable to parse FETCH expression");
      });

    }

    let data = await response.text();

    let ret: {
      type: string,
      value: string,
    } = {
      type: "",
      value:  "",
    };

    if (node.format === AST.DataType.JSON) {
      try {
        // TODO: figure out how to store stuff as JSON
        JSON.parse(data);
        ret.type = "JSON";
        ret.value = data;
      } catch (err) {
        switch (orNode?.handler) {
          case AST.OrType.EXIT:
            process.exit(Number(orNode.code));
          case AST.OrType.DIE:
            process.exit(ERR_EXIT_CODE);
        }
        throw new DQLSyntaxError(
          "received invalid JSON while parsing FETCH expression"
        );
      }
    } else if (node.format === AST.DataType.HTML) {
      ret.type = "HTML";
      ret.value = data;
    } else if (node.format === AST.DataType.TEXT) {
      ret.type = "TEXT";
      ret.value = data;
    } else {
      throw new DQLSyntaxError("need to specify the type for FETCH format", node.location.row, node.location.col);
    }

    return ret;
  }

  evalExtract(
    node: AST.ExtractExpression,
    nextNode?: AST.OrExpression
  ): AST.GeneralType {

    let ret: {
      type: string,
      value: string,
    } = {
      type: "",
      value: "",
    };

    if (!node?.format) {
      throw new DQLSyntaxError("EXTRACT needs a valid data type", node.location.row, node.location.col);
    }

    if (node?.from?.type === "IDENTIFIER") {
      if (!this.NS[node?.from?.value])
        throw new DQLReferenceError(
          `was unable to find variable ${node?.from?.value}`,
          node.location.row,
          node.location.col
        );
      node.from.value = this.NS[node.from?.value]?.value as string;
    }

    if (node.format === AST.DataType.JSON) {
      let val;
      try {
        val = JSON.parse(node?.from?.value ?? "");
      } catch (SyntaxError) {
        throw new DQLSyntaxError(
          "invalid JSON format",
          node.location.row,
          node.location.col
        );
      }

      let query;


      try {
        const propertyKeys = node.what.split(".");
        let result = val;

        for (const key of propertyKeys) {
          result = result?.[key];
        }
        query = result

      } catch (err) {
        throw new DQLSyntaxError(
          `invalid JSON query ${node.what}`,
          node.location.row,
          node.location.col
        );
      }

      if (!query) {
        throw new DQLSyntaxError(
          `was unable to parse ${val?.[node.what]} from JSON`,
          node.location.row,
          node.location.col
        );
      }
      ret.type = "STRING_LITERAL";
      ret.value = query;
    }
    if (node.format === AST.DataType.HTML) {
      let parsed = HTML.parse(node.from?.value ?? "");
      let t = parsed.querySelector(node.what);

      ret.value = JSON.stringify({
        ...t?.attributes,
        innerText: t?.childNodes.map((e) => e.rawText).join(" "),
      });
      ret.type = "JSON";
    }
    return ret;
  }

  evalPipe(node: AST.PipeExpression) {
    let src = null;

    if (node.source.type === Lexer.TokenType.STRING_LITERAL) {
      src = node.source.value;
    } else if (node.source.type === Lexer.TokenType.IDENTIFIER) {
      let foundVar = this.NS?.[node.source.value];
      if (!foundVar)
        throw new DQLReferenceError(
          `was unable to find variable '${node.source.value}'`
        );
      src = foundVar.value;
    }

    if (node.destination.type === AST.DestType.STDOUT) {
      process.stdout.write(src + "\n");
    } else if (node.destination.type === AST.DestType.FILE) {
      fs.writeFileSync(
        path.join(__dirname, node.destination.value as string),
        src as string
      );
    }
  }

  async run() {
    for (let i = 0; i < this.ASTDocument.body.length; i++) {
      let node = this.ASTDocument.body[i];
      let nextNode = this.ASTDocument.body?.[i + 1];

      switch (node.type) {
        case "VarDeclaration": {
          this.NS[node.identifier] = null;
          node = node as AST.VarDeclaration;

          if (node.value?.type === "FetchExpression") {
             let fetchedData = await this.evalFetch(
              node.value as AST.FetchExpression,
              nextNode?.type === "OrExpression"
                ? (nextNode as AST.OrExpression)
                : undefined
            );
            this.NS[node.identifier] = fetchedData;
            break;

          } else if (node.value?.type === "ExtractExpression") {
            this.NS[node.identifier] = this.evalExtract(
              node.value as AST.ExtractExpression,
              nextNode?.type === "OrExpression"
                ? (nextNode as AST.OrExpression)
                : undefined
            );
            break;
          }

          let target = node.value as AST.GeneralType;
          this.NS[node.identifier] = {
            type: target?.type,
            value: target?.value,
          };
          break;
        }
        case "PipeExpression": {
          this.evalPipe(node as AST.PipeExpression);
          break;
        }
      }
    }
  }

  getVar(varName: string): any {
    return this.NS?.[varName];
  }
}
