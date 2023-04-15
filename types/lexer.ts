export enum TokenType {
  OPERATOR = "OPERATOR",
  KEYWORD = "KEYWORD",
  IDENTIFIER = "IDENTIFIER",
  STRING_LITERAL = "STRING_LITERAL",
  URL_LITERAL = "URL_LITERAL",
  NULL = "NULL",
}

export interface Token {
  tokenType: TokenType,
  word: string,
  begin: number,
  end: number,
}  

export type Lex = Array<[number, Array<Token>]>;

export enum Tokens {
  VAR = "VAR",
  EQUALTO = "=",
  FETCH = "FETCH",
  TEXT = "TEXT",
  AS = "AS",
  JSON = "JSON",
  PIPE = "PIPE",
  STDOUT = "STDOUT",
  TO = "TO",
}

