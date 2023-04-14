import Lexer from "./Lexer";
import { Tokens, Lex, TokenType } from "../types/lexer";
import { MoleQLSyntaxError }  from "./exceptions";

class Parser {
  private lexedInput: Lex;
  private input: string;

  constructor(lexedInput: Lex, input: string) {
    this.lexedInput = lexedInput;
    this.input = input;
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
          case Tokens.VAR: {
            let varName = this.input
              .slice(lexedLine[j].end + 2, lexedLine[j + 1].begin)
              .trim();

            if (!varName) {
              throw new MoleQLSyntaxError("variable name expected", line, lexedLine[j].end + 2);
            }
            break;
          } case Tokens.EQUALTO: 
            if (
              lexedLine[j + 1].word === "VAR" 
              || lexedLine[j+1].tokenType === TokenType.OPERATOR
            ) {
              throw new MoleQLSyntaxError("expected LHS declaration, got expression", line, lexedLine[j].end + 2);
            }
            break;
        }
      }
    }
  }
}

let str = `
  VAR data = GET https://api.kanye.rest AS JSON 
  PIPE data TO STDOUT
  PIPE "hellow orld" TO STDOUT
`;

let lexer = new Lexer(str);
let tokens = lexer.lex();
let parser = new Parser(tokens, str);
parser.parse();
