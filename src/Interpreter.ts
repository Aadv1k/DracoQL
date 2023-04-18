import * as AST from "../types/ast";
import fetchBuffer from "../lib/fetch";
import { MQLSyntaxError, MQLNetworkError } from "./Exceptions";

export default class MQLInterpreter {
  ASTDocument: AST.ASTDocument;
  NS: any;

  constructor(ASTDocument: AST.ASTDocument) {
    this.ASTDocument = ASTDocument;
    this.NS = {};
  }

  async evalFetch(node: AST.FetchExpression): Promise<string | object> {
    let response: Array<Buffer> = await fetchBuffer(node.url).catch(_ => {
      throw new MQLNetworkError("unable to parse FETCH expression")
    });

    let data = response.toString();
    let ret: any;

    switch (node.format)  {
      case (AST.DataType.JSON):
        try {
          ret = JSON.parse(data);
        } catch (SyntaxError) {
          throw new MQLSyntaxError("received invalid JSON while parsing FETCH expression")
        } finally {
          break;
        }
      case (AST.DataType.TEXT):
        ret = data;
    }

    return ret;
  }

  async run() {
    for (let i = 0; i < this.ASTDocument.body.length; i++) {
      let node = this.ASTDocument.body[i];

      switch (node.type) {
        case "VarDeclaration": {
          this.NS[node.identifier] = null;
          node = node as AST.VarDeclaration;
          if (node.value?.type === "FetchExpression") {
            this.NS[node.identifier] = await this.evalFetch(node.value as AST.FetchExpression);
          } else {
            this.NS[node.identifier] = node.value;
          }
          break;
        }
      }
    }
  }

  getVar(varName: string): any {
    return this.NS?.[varName];
  }



}
