export class DQLSyntaxError extends Error {
  constructor(message: string, row?: number, col?: number) {
    super(
      `Invalid syntax${
        row && col ? ` at line ${row} and column ${col}` : ""
      }: ${message}`
    );
    this.name = "DQLSyntaxError";
    this.message = `Invalid syntax${
      row && col ? ` at line ${row} and column ${col}` : ""
    }: ${message}`;
    this.stack = "";
  }
}

export class DQLReferenceError extends Error {
  constructor(message: string, row?: number, col?: number) {
    super(
      `variable not found${
        row && col ? ` at line ${row} and column ${col}` : ""
      }: ${message}`
    );
    this.name = "DQLReferenceError";
    this.message = `variable not found${
      row && col ? ` at line ${row} and column ${col}` : ""
    }: ${message}`;
    this.stack = "";
  }
}

export class DQLMissingBody extends Error {
  constructor(message: string, row?: number, col?: number) {
    super(
      `network error ${
        row && col ? ` at line ${row} and column ${col}` : ""
      }: ${message}`
    );
    this.name = "DQLMissingBody";
    this.message = `network error ${
      row && col ? ` at line ${row} and column ${col}` : ""
    }: ${message}`;
    this.stack = "";
  }
}

export class DQLNetworkError extends Error {
  constructor(message: string, row?: number, col?: number) {
    super(
      `network error ${
        row && col ? ` at line ${row} and column ${col}` : ""
      }: ${message}`
    );
    this.name = "DQLNetworkError";
    this.message = `network error ${
      row && col ? ` at line ${row} and column ${col}` : ""
    }: ${message}`;
    this.stack = "";
  }
}
