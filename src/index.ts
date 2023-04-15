import Lexer from "./Lexer";
import { Tokens, Lex, TokenType } from "../types/lexer";
import { MoleQLSyntaxError }  from "./exceptions";

class Parser {
  private lexedInput: Lex;
  private input: string;
  private NS: any;

  constructor(lexedInput: Lex, input: string) {
    this.lexedInput = lexedInput;
    this.input = input;
    this.NS = {};
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
            let varName = this.input
              .slice(lexedLine[j].end + 2, lexedLine[j + 1].begin)
              .trim();

            if (!varName) {
              throw new MoleQLSyntaxError("variable name expected", line, lexedLine[j].end + 2);
            }

            this.NS[varName] = null;
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
            if (lexedLine.length - 1 < j+1) {
              throw new MoleQLSyntaxError(`FETCH expects a URL got none`, line, lexedLine[j].end + 2);
            }
            console.log(this.input.slice(lexedLine[j].end + 2, lexedLine[j+1].begin).trim());
            break;
        } 
         
      }
    }
  }
}

 //https://api.kanye.rest AS JSON 
let str = ` PIPE "hellow world" TO STDOUT `;

let lexer = new Lexer(str);
let tokens = lexer.lex();
console.log(tokens[0]);
//let parser = new Parser(tokens, str);
//parser.parse();
