import * as Lexer from "../types/lexer";
import * as AST from "../types/ast";
import fetchBuffer from "../lib/fetch";
import { DQLSyntaxError, DQLNetworkError, DQLReferenceError } from "./Exceptions";

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
    let response: Array<Buffer> = await fetchBuffer(node.url).catch((_) => {
      throw new DQLNetworkError("unable to parse FETCH expression");
    });

    let data = response.toString();
    let ret: any;

    if (node.format === AST.DataType.JSON) {
      try {
        ret = JSON.parse(data);
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
              nextNode.type === "OrExpression" ? nextNode as AST.OrExpression : undefined
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
