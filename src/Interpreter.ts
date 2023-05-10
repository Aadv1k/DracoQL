import * as Lexer from "./types/lexer";
import * as AST from "./types/ast";

import {
  DQLSyntaxError,
  DQLNetworkError,
  DQLReferenceError,
  DQLMissingBody,
} from "./Exceptions";

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

    let output: AST.GeneralType;
    let response: any;

    if (node?.meta?.method === "POST") {
      if (!node.meta?.body?.value)
        throw new DQLMissingBody(
          "FETCH with POST expected a BODY, found none",
          node.location.row,
          node.location.col
        );
      response = await fetch(
        node.url, 
        {
          method: "POST",
          headers: node.meta?.headers,
          body: node.meta.body.value,
        }
      ).catch((_a: string) => {
        throw new DQLNetworkError("unable to parse FETCH expression");
      });
    } 

    if (node?.meta?.method === "GET" || !node?.meta?.method) {
      response = await fetch(node.url, {
        method: "GET",
        headers: node.meta?.headers
      }).catch((_a: string) => {
        throw new DQLNetworkError("unable to parse FETCH expression");
      });
    }

    switch (node.format) {
      case AST.DataType.JSON:
        try {
          output = this.generalTypeBuilder("JSON", await response.json())
        } catch (err) {
          switch (orNode?.handler) {
            case AST.OrType.EXIT:
              // Browser equivalent?
            case AST.OrType.DIE:
              // Browser equivalent?
          }
          throw new DQLSyntaxError(
            "received invalid JSON while parsing FETCH expression"
          );
        }
        break;
      case AST.DataType.HTML:
        const htmlStr = await response.text();
        output = this.generalTypeBuilder("HTML", htmlStr);
        break;
      case AST.DataType.TEXT:
        output = this.generalTypeBuilder(AST.DataType.TEXT, await response.text());
        break;
      default:
        output = this.generalTypeBuilder("RESPONE", {
          headers: Object.fromEntries(response.headers),
          status: response.status,
          url: response.url,
          redirected: response.redirected
        });
        break;
    }

    return output;
  }

  parseHtmlElement(element: any): any {
  let children = [];

  for (const child of element.childNodes) {
    if (child instanceof Text) {
      children.push({
        type: "TextNode",
        text: child.nodeValue,
      });
      continue;
    } else if (child instanceof HTMLElement) {
      children.push(this.parseHtmlElement(child));
    }
  }

  return {
    tag: element.tagName.toLowerCase(),
    attributes: Array.from(element.attributes).reduce((obj: any, attr: any) => {
      obj[attr.name] = attr.value;
      return obj;
    }, {}),
    children,
  };

  }

  evalExtract(
    node: AST.ExtractExpression,
    nextNode?: AST.OrExpression
  ): AST.GeneralType {

    let ret: {
      type: any,
      value: any,
    } = {
      type: "",
      value: "",
    };

    let format;
    format = node?.format;

    if (node?.from?.type === "IDENTIFIER") {
      if (!this.NS[node?.from?.value])
        throw new DQLReferenceError(
          `was unable to find variable ${node?.from?.value}`,
          node.location.row,
          node.location.col
        );

      format = this.NS[node.from?.value]?.type;
      node.from.value = this.NS[node.from?.value]?.value as string;
    }

    if (!format) {
      throw new DQLSyntaxError("EXTRACT needs a valid data type", node.location.row, node.location.col);
    }

    if (format === AST.DataType.JSON) {
      let val;
      try {
        val = node?.from?.value;
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
        let result: any = val;
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
          `was unable to parse ${node.what} from JSON`,
          node.location.row,
          node.location.col
        );
      }
      ret.type = "STRING_LITERAL";
      ret.value = query;
    }
    if (format === AST.DataType.HTML) {
      let parsed: any = node.from?.value;
      let foundElement = parsed.querySelector(node.what);

      if (!foundElement) {
        throw new DQLSyntaxError(
          `was unable to parse ${node.what} from HTML`,
          node.location.row,
          node.location.col
        );
      }
      ret.value = this.parseHtmlElement(foundElement);
      ret.type = "JSON";
    } else if (format === "RESPONSE") {
      let query;
      try {
        query = eval(`node.from?.value.${node.what}`);
      } catch {
        query = undefined;
      }

      if (!query) {
        throw new DQLSyntaxError(
          `was unable to parse ${node.what} from RESPONSE`,
          node.location.row,
          node.location.col
        );
      }

      ret.value = query;
      ret.type = "JSON"
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
      console.log(typeof src);

    } else if (node.destination.type === AST.DestType.FILE) {
      console.warn("FILE destination not supported")
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


  generalTypeBuilder(type: string, value: any): AST.GeneralType {
    return {
      type,
      value,
    }

  }
  

  getVar(varName: string): any {
    return this.NS?.[varName];
  }
}
