import { TokenType, Token, Tokens, Lex } from "../types/lexer";

export default class Lexer {
  private input: string;
  private cursor: number;
  private end: boolean;
  private stack: Array<Token>;

  constructor(input: string) {
    this.input = input;
    this.cursor = -1;
    this.stack = [];
    this.end = false;
  }

  advance(line: string): string {
    if (this.cursor + 1 > line.length) {
      this.end = true;
    }
    this.cursor++;
    return line[this.cursor]
  }

  handleToken(token: string): void  {
    let obj: Token = {
      word: token.trim(),
      begin: this.cursor - token.trim().length,
      end: this.cursor - 1,
      tokenType: TokenType.NULL,
    };

    switch (token.trim()) {
      case Tokens.EQUALTO: 
        obj.tokenType = TokenType.OPERATOR;
        this.stack.push(obj)
        break;
      case Tokens.VAR:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.GET: 
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.AS: 
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.JSON: 
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.PIPE: 
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.STDOUT: 
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.TO: 
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
    }
  }

  lexLine(line: string): Array<Token> {
    let stack = "";

    while (!this.end) {
      let cur = this.advance(line);
      if (cur === " ") {
        this.handleToken(stack);
        stack = "";
        continue;
      }
      stack += cur;
    }

    this.cursor = -1;
    this.end = false;

    let local = this.stack;
    this.stack = [];

    return local;
  }

  lex(): Lex {
    let lines = this.input.split('\n');

    let parsed = lines.map((line: string, i) => {
      return [i+1, this.lexLine(line)] as [number, Token[]]
    });

    return parsed;
  }

}
