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
  | ExtractExpression

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

export enum BodyType {
  JSON = 'JSON',
  TEXT = 'TEXT',
  FILE = 'FILE',
  FORM = "FORM",
}

export enum DataType {
  JSON = 'JSON',
  TEXT = 'TEXT',
  HTML = 'HTML',
  BUFFER = 'BUFFER',
  FILE = 'FILE',
  NULL = "NULL",
} 

export interface FetchExpression {
  type: "FetchExpression",
  url: string,
  meta?: {
    method?: string,
    headers?: {
      [key: string]: string,
    }
    body?: GeneralType
  } | null,
  format: DataType | null,
  location: Location,
  cache?: {
    dir: string,
    timeout: number,
  },
  headless?: boolean
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
  value: any,
}

export interface VarDeclaration {
  type: "VarDeclaration",
  identifier: string,
  value: FetchExpression | GeneralType | ExtractExpression | null,
  location: Location,
}

export interface ExtractExpression {
  type: "ExtractExpression",
  from: GeneralType | null,
  what: string,
  location: Location,
  format?: DataType,
}

export interface PipeExpression {
  type: "PipeExpression",
  source: PipeSource,
  destination: PipeDestination,
  location: Location,
}

export enum PRESETS {
  custom = "custom",
  email = "email",
  whatsapp = "whatsapp",
}

export enum DestType {
  FILE = "FILE",
  STDOUT = "STDOUT",
  PRESET = "PRESET"
}

