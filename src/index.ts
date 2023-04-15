import Lexer from "./Lexer";
import { Tokens, Lex, TokenType } from "../types/lexer";
import * as AST from "../types/ast";
import { MoleQLSyntaxError }  from "./exceptions";

class MQlParser {
  private lexedInput: Lex;
  private input: string;
  private NS: any;
  private AST: any;

  constructor(lexedInput: Lex, input: string) {
    this.lexedInput = lexedInput;
    this.input = input;
    this.NS = {};
    this.AST = {
      type: "Program", // TODO: determine where the evaluater is run from 
      body: []
    };
  }

  parse(): void {
    for (let i = 0; i < this.lexedInput.length; i++) {
      if (this.lexedInput[i][1].length === 0) {
        continue;
      }
      let lexedLine = this.lexedInput[i][1];
      let line = this.lexedInput[i][0];

      for (let j = 0; j < lexedLine.length; j++) {
        switch (lexedLine[j].word) {
          case Tokens.VAR:
            let literal = lexedLine[j + 1];
            if (literal?.tokenType !== TokenType.IDENTIFIER) {
              throw new MoleQLSyntaxError("variable name expected", line, lexedLine[j].end + 2);
            }

            this.NS[literal.word] = null;

            let varDecl: AST.VarDeclaration = {
              type: "VarDeclaration",
              location: {
                row: i,
                col: lexedLine[j].begin,
              },
              identifier: literal.word,
              value: {},
            }
            this.AST.body.push(varDecl)
            break;
          case Tokens.EQUALTO: 
            if (
              lexedLine[j + 1]?.word === "VAR" 
              || lexedLine[j+1]?.tokenType === TokenType.OPERATOR
            ) {
              throw new MoleQLSyntaxError(`expected LHS declaration, got ${lexedLine[j+1]?.tokenType.toLowerCase()}`, line, lexedLine[j].end + 2);
            }
            break;
          case Tokens.FETCH:  
            if (lexedLine[j+1].tokenType !== TokenType.URL_LITERAL) {
              throw new MoleQLSyntaxError(`FETCH expects a URL_LITERAL got ${lexedLine[j+1]?.tokenType ?? "none"}`, line, lexedLine[j].end + 2);
            }
            let astHead = this.AST.body.slice(-1)[0];
            let fetchExpr: AST.FetchExpression = {
              type: "FetchExpression",
              url: lexedLine[j+1].word,
              format: AST.DataType.NULL,
              location: {
                row: i,
                col: lexedLine[j].begin,
              }
            } 
            if (astHead && astHead.type === "VarDeclaration") {
              astHead.value = fetchExpr;
              break;
            }
            this.AST.body.push(fetchExpr);
            break;
          case Tokens.AS: 
            let dataTypes: Array<string> = Object.values(AST.DataType)
            let asType = lexedLine[j+1].word;
            if (!lexedLine[j+1] || !dataTypes.includes(asType)) {
              throw new MoleQLSyntaxError(`AS expects a valid data type got ${lexedLine[j+1]?.word ?? "none"}`, line, lexedLine[j].end + 2);
            };

            let tail = this.AST.body.slice(-1)[0]
            if (tail?.value?.type !== "FetchExpression") {
              throw new MoleQLSyntaxError(`AS needs a valid expressiont to cast`, line, lexedLine[j].end + 2);
            }
            tail.value.format = asType;
            break;
        } 
      }
    }
    console.log(JSON.stringify(this.AST))
  }
}

let str = `
VAR data = FETCH https://api.kanye.rest AS JSON 
VAR 
`;

let lexer = new Lexer(str);
let tokens = lexer.lex();
let parser = new MQlParser(tokens, str);
parser.parse();
