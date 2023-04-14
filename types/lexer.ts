export enum TokenType {
  OPERATOR = "OPERATOR",
  KEYWORD = "KEYWORD",
  VARIABLE = "VARIABLE",
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
  GET = "GET",
  AS = "AS",
  JSON = "JSON",
  PIPE = "PIPE",
  STDOUT = "STDOUT",
  TO = "TO",
}

