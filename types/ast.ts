import { TokenType } from "./lexer";

interface Location {
  row: number,
  col: number,
}

export enum DataType {
  JSON = 'JSON',
  TEXT = 'TEXT',
  BUFFER = 'BUFFER',
  FILE = 'FILE',
  NULL = "NULL",
} 

export interface FetchExpression {
  type: "FetchExpression",
  url: string,
  format: DataType,
  location: Location,
}

export interface VarDeclaration {
  type: "VarDeclaration",
  identifier: string,
  value: FetchExpression | {},
  location: Location,
}

export enum DEST_TYPE {
  FILE = "FILE",
  STDOUT = "STDOUT",
  SQL = "SQL",
  DOCUMET = "DOCUMENT",
  WEBRESOURCE = "WEBRESOURCE",
  FILE_SERVER = "FILE_SERVER",
  NULL = "NULL",
}

export interface PipeExpression {
  type: "PipeExpression",
  source: {
    type: TokenType // expects TokenType.STRING_LITERAL | TokenType.IDENTIFIER,
    value: string,
  },
  destination: {
    type: DEST_TYPE,
    value: string | null, // STDOUT may not have a value 
  }
  location: Location,
}
