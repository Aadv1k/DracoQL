import { TokenType } from "./lexer";

interface Location {
  row: number,
  col: number,
}

export interface Destination {
  type: DEST_TYPE,
  value: string | null, // STDOUT may not have a value 
}

export interface Source {
  type: TokenType // expects TokenType.STRING_LITERAL | TokenType.IDENTIFIER,
  value: string,
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
  //TODO: error handling via else: PipeExpression | DieExpression,
  location: Location,
}

export interface DieExpression {
  type: "DieExpression",
  value?: string,
  code?: number,
}

export interface VarDeclaration {
  type: "VarDeclaration",
  identifier: string,
  value: FetchExpression | {},
  location: Location,
}

export interface PipeExpression {
  type: "PipeExpression",
  source: Source,
  destination: Destination,
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

