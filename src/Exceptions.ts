export class MQLSyntaxError extends Error {
  constructor(message: string, row?: number, col?: number) {
    super(`Invalid syntax${(row && col) ? ` at line ${row} and column ${col}` : ''}: ${message}`);
    this.name = 'MQLSyntaxError';
    this.stack = '';
  }
}

export class MQLReferenceError extends Error {
  constructor(message: string, row?: number, col?: number) {
    super(`variable not found${(row && col) ? ` at line ${row} and column ${col}` : ''}: ${message}`);
    this.name = 'MQLReferenceError';
    this.stack = '';
  }
}
