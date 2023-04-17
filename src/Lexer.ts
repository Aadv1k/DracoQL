import { TokenType, Token, Tokens, Lex } from "../types/lexer";
import { MQLSyntaxError } from "./Exceptions";
import { isURL } from "../lib/utils";

export default class MQLLexer {
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

  handleToken(token: string, isStr?: boolean): void  {
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
      case Tokens.FETCH: 
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
      case Tokens.DIE:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.EXIT:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.OR:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj)
        break;
      case Tokens.EXTERN: 
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;

      default: 
        if (token.trim().length < 1) break;
        if (
          (
            this.stack[this.stack.length - 1]?.word === "VAR" ||
            this.stack[this.stack.length - 1]?.word === "PIPE" ||
            this.stack[this.stack.length - 1]?.word === "EXTERN" 
            && !isStr
          ) && !isURL(obj.word)
        ) {
          obj.tokenType = TokenType.IDENTIFIER;
          this.stack.push(obj)
          break;
        }

        if (isURL(obj.word)) {
          obj.tokenType = TokenType.URL_LITERAL;
          this.stack.push(obj)
          break;
        }

        if (Number.isInteger(Number(obj.word))) {
          obj.tokenType = TokenType.INT_LITERAL;
          this.stack.push(obj)
          break
        }

        if (!isStr) {
          throw new MQLSyntaxError(`Unknown token ${token}`);
        }

        obj.tokenType = TokenType.STRING_LITERAL;
        this.stack.push(obj)
    }
  }

  lexLine(line: string): Array<Token> {
    let stack = "";
    let open = false;
    let quotes = "";

    while (!this.end) {
      let cur = this.advance(line);

      if (cur === "\"" && !open) {
        open = true;
        continue;
      }

      if (cur === "\"" && open) {
        this.handleToken(quotes, true);
        quotes = "";
        open = false;
        continue;
      }

      if (open) {
        quotes += cur;
        continue;
      }

      if (cur === " " || cur === undefined) {
        this.handleToken(stack);
        stack = "";
        continue;
      }
      stack += cur;
    }

    if (open) {
      throw new MQLSyntaxError("string literal must be terminated");
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
