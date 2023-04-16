import MQLLexer from "./Lexer";
import { Tokens, Lex, TokenType } from "../types/lexer";
import * as AST from "../types/ast";
import { MQLSyntaxError }  from "./Exceptions";

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
        let tail: any = this.AST.body.slice(-1)[0];

        switch (lexedLine[j].word) {
          case Tokens.VAR:
            let literal = lexedLine[j + 1];
            if (literal?.tokenType !== TokenType.IDENTIFIER) {
              throw new MQLSyntaxError("variable name expected", line, lexedLine[j].end + 2);
            }

            let varDecl: AST.VarDeclaration = {
              type: "VarDeclaration",
              location: {
                row: i,
                col: lexedLine[j].begin,
              },
              identifier: literal.word,
              value: {},
            }
            this.NS[literal.word] = null;
            this.AST.body.push(varDecl)
            break;
          case Tokens.EQUALTO: 
            if (
              lexedLine[j+1]?.tokenType === TokenType.OPERATOR || 
              !lexedLine[j+1]
            ) {
              throw new MQLSyntaxError(`expected LHS declaration, got ${lexedLine[j+1]?.tokenType.toLowerCase() ?? "none"}`, line, lexedLine[j].end + 2);
            }
            break;
          case Tokens.FETCH:  
            if (lexedLine[j+1]?.tokenType !== TokenType.URL_LITERAL) {
              throw new MQLSyntaxError(`FETCH expects a URL_LITERAL got ${lexedLine[j+1]?.tokenType ?? "none"}`, line, lexedLine[j].end + 2);
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
              throw new MQLSyntaxError(`AS expects a valid data type got ${lexedLine[j+1]?.word ?? "none"}`, line, lexedLine[j].end + 2);
            };

            if (tail?.value?.type !== "FetchExpression") {
              throw new MQLSyntaxError(`AS needs a valid expression to cast`, line, lexedLine[j].end + 1);
            }
            this.AST[this.AST.length - 1].value.format = asType;
            break;
          case Tokens.PIPE:
            if (!lexedLine[j+1] || !(lexedLine[j+1].tokenType === TokenType.IDENTIFIER ||
                lexedLine[j+1].tokenType === TokenType.STRING_LITERAL ||
                lexedLine[j+1].tokenType === TokenType.URL_LITERAL
              )
            ) {
              throw new MQLSyntaxError(`PIPE needs a valid literal or reference`, line, lexedLine[j].end + 1);
            };
            let pipeExpr: AST.PipeExpression = {
              type: "PipeExpression",
              source: {
                type: lexedLine[j+1].tokenType,
                value: lexedLine[j+1].word,
              },
              destination: {
                type: AST.DEST_TYPE.NULL,
                value: null,
              },
              location: {
                row: i,
                col: lexedLine[j].begin,
              }
            }
            this.AST.body.push(pipeExpr)
            break;
          case Tokens.TO: 
            if (tail?.type !== "PipeExpression") {
              throw new MQLSyntaxError(`TO excepts a valid PIPE expression before`, i + 1, lexedLine[j].end + 1)
            }
            let toOutput = lexedLine[j+1];
            let toOutputValues: Array<string> = Object.values(AST.DEST_TYPE);
            if (!toOutput || 
              toOutput.tokenType !== TokenType.KEYWORD || 
              !toOutputValues.includes(toOutput.word)
            ) {
              throw new MQLSyntaxError(`TO expects a valid destination, got ${toOutput ? `a ${toOutput.tokenType.toLowerCase()} '${toOutput.word}'` : 'none'}`, i, lexedLine[j].end + 2);
            }


            if (tail?.type !== "PipeExpression") {
              throw new MQLSyntaxError(`TO expects a PIPE expression, got ${tail?.type ?? 'none'}`, i, lexedLine[j].begin);
            }

            let astDest: AST.Destination  = {
              type: AST.DEST_TYPE[toOutput.word as keyof typeof AST.DEST_TYPE],
              value: null,
            };

            //if (astDest.type === AST.DEST_TYPE.FILE) { } TODO: Handle this
            this.AST.body[this.AST.body.length - 1].destination = astDest;
        } 
      }
    }
    console.log(JSON.stringify(this.AST));
  }
}

let str = `
PIPE "hello world" TO STDOUT
`; 

let lexer = new MQLLexer(str);
let tokens = lexer.lex();
let parser = new MQlParser(tokens, str);
parser.parse();
