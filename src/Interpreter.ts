import * as Lexer from "./types/lexer";
import * as AST from "./types/ast";
import { GET, POST } from "./lib/fetch";
import fs from "node:fs";
import path from "node:path";
import { DQLSyntaxError, DQLNetworkError, DQLReferenceError, DQLMissingBody } from "./Exceptions";

const ERR_EXIT_CODE = 1;

export default class DQLInterpreter {
  ASTDocument: AST.ASTDocument;
  NS: {
    [key: string]: string | null,
  };

  constructor(ASTDocument: AST.ASTDocument) {
    this.ASTDocument = ASTDocument;
    this.NS = {};
  }

  async evalFetch(node: AST.FetchExpression, orNode?: AST.OrExpression): Promise<string> {
    let response: Array<Buffer>; 

    if (node?.meta?.method === "POST") {
      if (!node.meta?.body?.value) throw new DQLMissingBody("FETCH with POST expected a BODY, found none", node.location.row, node.location.col);
      response = await POST(node.url, node.meta.body.value, node.meta?.headers).catch((_a: string) => {
        throw new DQLNetworkError("unable to parse FETCH expression");
      });
    } else {
      response = await GET(node.url).catch((_a: string) => {
        throw new DQLNetworkError("unable to parse FETCH expression");
      });
    }


    let data = response.toString();
    let ret: any;

    if (node.format === AST.DataType.JSON) {
      try {
        // TODO: figure out how to store stuff as JSON
        JSON.parse(data);
        ret = data;
      } catch (SyntaxError) {
        switch (orNode?.handler) {
          case AST.OrType.EXIT: 
            process.exit(Number(orNode.code))
          case AST.OrType.DIE:
            process.exit(ERR_EXIT_CODE)
        }
        throw new DQLSyntaxError(
          "received invalid JSON while parsing FETCH expression"
        );
      }
    } else {
      ret = data;
    }
    return ret;
  }

  evalPipe(node: AST.PipeExpression) {
    let src = null;

    if (node.source.type ===  Lexer.TokenType.STRING_LITERAL) {
      src = node.source.value;
    } else if (node.source.type ===  Lexer.TokenType.IDENTIFIER) {
      let foundVar = this.NS?.[node.source.value];
      if (!foundVar) throw new DQLReferenceError(`was unable to find variable '${node.source.value}'`);
      src = foundVar;
    }

    if (node.destination.type === AST.DestType.STDOUT) {
      process.stdout.write(src + '\n');
    } else if (node.destination.type === AST.DestType.FILE) {
      fs.writeFileSync(path.join(__dirname, node.destination.value as string), src as string);
    }
  }

  async run() {
    for (let i = 0; i < this.ASTDocument.body.length; i++) {
      let node = this.ASTDocument.body[i];
      let nextNode = this.ASTDocument.body?.[i+1];

      switch (node.type) {
        case "VarDeclaration": {
          this.NS[node.identifier] = null;
          node = node as AST.VarDeclaration;
          if (node.value?.type === "FetchExpression") {
            this.NS[node.identifier] = await this.evalFetch(
              node.value as AST.FetchExpression,
              nextNode?.type === "OrExpression" ? nextNode as AST.OrExpression : undefined
            );
            break;
          } 
          let target = node.value as AST.GeneralType;
          this.NS[node.identifier] = target.value;
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
