import { TokenType } from "./lexer";

export interface ASTDocument {
  type: string,
  body: Array<ASTNode>
}

export type Namespace = {
  [key: string]: string;
}

export type ASTNode = 
  FetchExpression 
  | VarDeclaration
  | PipeExpression
  | OrExpression
  | ExternExpression

export type ExternExpression = {
  type: string,
  identifier: string,
  value: string,
  location: Location,
}

interface Location {
  row: number,
  col: number,
}

export interface PipeDestination {
  type: DestType | null,
  value: string | null, // STDOUT may not have a value 
}

export interface PipeSource {
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
  format: DataType | null,
  location: Location,
}

export enum OrType {
  DIE = "DIE",
  EXIT = "EXIT",
}

export interface OrExpression {
  type: "OrExpression",
  handler: OrType,
  code?: number,
}

export interface GeneralType {
  type: string,
  value: string,
}

export interface VarDeclaration {
  type: "VarDeclaration",
  identifier: string,
  value: FetchExpression | GeneralType | null,
  location: Location,
}

export interface PipeExpression {
  type: "PipeExpression",
  source: PipeSource,
  destination: PipeDestination,
  location: Location,
}

export enum DestType {
  FILE = "FILE",
  STDOUT = "STDOUT",
  SQL = "SQL",
  DOCUMET = "DOCUMENT",
  WEBRESOURCE = "WEBRESOURCE",
  FILE_SERVER = "FILE_SERVER",
  EXTERN = "EXTERN",
}

