export class MoleQLSyntaxError extends Error {
  constructor(message: string, row?: number, col?: number) {
    super(`Invalid syntax${(row && col) ? ` at line ${row} and column ${col}` : ''}: ${message}`);
    this.name = 'MoleQLSyntaxError';
  }
}
