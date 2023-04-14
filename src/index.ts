enum TokenType {
  OPERATOR = "OPERATOR",
  KEYWORD = "KEYWORD",
  VARIABLE = "VARIABLE",
  NULL = "NULL",
}

interface Token {
  tokenType: TokenType,
  word: string,
  begin: number,
  end: number,
}  

enum Tokens {
  VAR = "VAR",
  EQUALTO = "=",
  GET = "GET",
  AS = "AS",
  JSON = "JSON",
  PIPE = "PIPE",
  STDOUT = "STDOUT",
  TO = "TO",
}


class Lexer {
  private input: string;
  private cursor: number;
  private end: boolean;
  private stack: Array<Token>;

  constructor(input: string) {
    this.input = input.trim();
    this.cursor = -1;
    this.stack = [];
    this.end = false;
  }

  advance(): string {
    if (this.cursor + 1 > this.input.length) {
      this.end = true;
    }
    this.cursor++;
    return this.input[this.cursor]
  }

  chopUntilToken(start: number): number {
    for (let i = start; i < this.input.length; i++) {
      if (this.input[i] === '=') {
        return i;
      }
    }
    return -1;
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

  lex(): void {
    let stack = "";

    while (!this.end) {
      let cur = this.advance();
      if (cur === " ") {
        this.handleToken(stack);
        stack = "";
        continue;
      }
      stack += cur;
    }

    console.log(this.stack);
  }

}

let lexer = new Lexer(`VAR hello = GET https://api.kanye.rest AS JSON PIPE data TO STDOUT`);
lexer.lex();
