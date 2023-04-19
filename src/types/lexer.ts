export enum TokenType {
  OPERATOR = "OPERATOR",
  KEYWORD = "KEYWORD",
  IDENTIFIER = "IDENTIFIER",
  STRING_LITERAL = "STRING_LITERAL",
  URL_LITERAL = "URL_LITERAL",
  INT_LITERAL = "INT_LITERAL",
  QUERY_LITERAL = "QUERY_LITERAL",
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
  OR = "OR",
  EXIT = "EXIT",
  DIE = "DIE",
  EQUALTO = "=",
  EXTERN = "EXTERN",
  FETCH = "FETCH",
  METHOD = "METHOD",
  HEADER = "HEADER",
  EXTRACT = "EXTRACT",
  FROM = "FROM",
  BODY = "BODY",
  TEXT = "TEXT",
  JSON = "JSON",
  HTML = "HTML",
  FILE = "FILE",
  FORM = "FORM",
  AS = "AS",
  PIPE = "PIPE",
  STDOUT = "STDOUT",
  TO = "TO",
}

