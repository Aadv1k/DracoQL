import { TokenType, Token, Tokens, Lex } from "./types/lexer";
import { DQLSyntaxError } from "./Exceptions";
import { isURL, isLowerCase } from "./lib/utils";

export default class DQLLexer {
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
    return line[this.cursor];
  }

  handleToken(token: string, isStr?: boolean): void {
    let obj: Token = {
      word: token.trim(),
      begin: this.cursor - token.trim().length,
      end: this.cursor - 1,
      tokenType: TokenType.NULL,
    };

    switch (token.trim()) {
      case Tokens.EQUALTO:
        obj.tokenType = TokenType.OPERATOR;
        this.stack.push(obj);
        break;
      case Tokens.VAR:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.FETCH:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.EXTRACT:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.FROM:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.HEADER:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.METHOD:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.BODY:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.FORM:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.HEADER:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.AS:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.JSON:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.HTML:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.FILE:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.TEXT:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.PIPE:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.STDOUT:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.TO:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.DIE:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.EXIT:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.OR:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;
      case Tokens.EXTERN:
        obj.tokenType = TokenType.KEYWORD;
        this.stack.push(obj);
        break;

      default:
        if (token.trim().length < 1) break;

        if (this.stack[this.stack.length - 1]?.word === "EXTRACT") {
          obj.tokenType = TokenType.QUERY_LITERAL;
          this.stack.push(obj);
          break;
        }

        if (!isStr && this.stack[this.stack.length - 1]?.tokenType === TokenType.IDENTIFIER) {
          throw new DQLSyntaxError(`Unknown token ${token}`);
        }

        if (
          isLowerCase(obj.word) &&
          !isStr &&
          !isURL(obj.word) &&
          !Number(obj.word)
        ) {
          obj.tokenType = TokenType.IDENTIFIER;
          this.stack.push(obj);
          break;
        }

        if (isURL(obj.word)) {
          obj.tokenType = TokenType.URL_LITERAL;
          this.stack.push(obj);
          break;
        }

        if (Number.isInteger(Number(obj.word))) {
          obj.tokenType = TokenType.INT_LITERAL;
          this.stack.push(obj);
          break;
        }

        obj.tokenType = TokenType.STRING_LITERAL;
        this.stack.push(obj);
    }
  }

  lexLine(line: string): Array<Token> {
    let stack = "";
    let open = false;
    let singleOpen = false;
    let quotes = "";

    if (line.startsWith("//")) return [];

    while (!this.end) {
      let cur = this.advance(line);

      if (cur === "'" && !singleOpen) {
        singleOpen = true;
        continue;
      }

      if (cur === '"' && !open && !singleOpen) {
        open = true;
        continue;
      }

      if (cur === "'" && singleOpen) {
        this.handleToken(quotes, true);
        singleOpen = false;
        continue;
      }

      if (cur === '"' && open && !singleOpen) {
        this.handleToken(quotes, true);
        quotes = "";
        open = false;
        continue;
      }

      if (open && !singleOpen) {
        quotes += cur;
        continue;
      }

      if (singleOpen) {
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

    if (open || singleOpen) {
      throw new DQLSyntaxError("string literal must be terminated");
    }

    this.cursor = -1;
    this.end = false;

    let local = this.stack;
    this.stack = [];

    return local;
  }

  lex(): Lex {
    let lines = this.input.split("\n");
    let parsed = lines.map((line: string, i) => {
      let arr: Token[];

      if (line.startsWith("//")) {
        arr = [];
      } else {
        arr = this.lexLine(line);
      }
      return [i + 1, arr] as [number, Token[]];
    });
    return parsed;
  }
}
