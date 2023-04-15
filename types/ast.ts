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
