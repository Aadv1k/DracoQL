import { Tokens, Lex, TokenType } from "../types/lexer";
import * as AST from "../types/ast";
import { MQLSyntaxError } from "./Exceptions";

export default class MQlParser {
  private lexedInput: Lex;
  private NS: any;
  private AST: AST.ASTDocument;

  constructor(lexedInput: Lex, NS?: AST.Namespace) {
    this.lexedInput = lexedInput;
    this.NS = {
      ...NS,
    };
    this.AST = {
      type: "Program", // TODO: determine where the evaluater is run from
      body: [],
    };
  }

  parse(): AST.ASTDocument {
    for (let i = 0; i < this.lexedInput.length; i++) {
      if (this.lexedInput[i][1].length === 0) {
        continue;
      }
      let lexedLine = this.lexedInput[i][1];
      let line = this.lexedInput[i][0];

      for (let j = 0; j < lexedLine.length; j++) {
        let tail: any = this.AST.body.slice(-1)[0];

        switch (lexedLine[j].word) {
          case Tokens.VAR:
            let literal = lexedLine[j + 1];
            if (literal?.tokenType !== TokenType.IDENTIFIER) {
              throw new MQLSyntaxError(
                "variable name expected",
                line,
                lexedLine[j].end + 2
              );
            }
            let varDecl: AST.VarDeclaration = {
              type: "VarDeclaration",
              location: {
                row: i + 1,
                col: lexedLine[j].begin,
              },
              identifier: literal.word,
              value: {},
            };
            this.NS[literal.word] = null;
            this.AST.body.push(varDecl);
            break;
          case Tokens.EQUALTO:
            if (
              lexedLine[j + 1]?.tokenType === TokenType.OPERATOR ||
              !lexedLine[j + 1]
            ) {
              throw new MQLSyntaxError(
                `expected LHS declaration, got ${
                  lexedLine[j + 1]?.tokenType.toLowerCase() ?? "none"
                }`,
                line,
                lexedLine[j].end + 2
              );
            }
            if (
              lexedLine[j + 1].tokenType === TokenType.URL_LITERAL ||
              lexedLine[j + 1].tokenType === TokenType.STRING_LITERAL ||
              lexedLine[j + 1].tokenType === TokenType.INT_LITERAL
            ) {
              let target = this.AST.body[
                this.AST.body.length - 1
              ] as AST.VarDeclaration;
              target.value = {
                type: lexedLine[j + 1].tokenType,
                value: lexedLine[j + 1].word,
              };
            }
            break;
          case Tokens.FETCH: //  fetch a URL_LITERAL
            if (lexedLine[j + 1]?.tokenType !== TokenType.URL_LITERAL) {
              throw new MQLSyntaxError(
                `FETCH expects a URL_LITERAL got ${
                  lexedLine[j + 1]?.tokenType ?? "none"
                }`,
                line,
                lexedLine[j].end + 2
              );
            }
            let fetchExpr: AST.FetchExpression = {
              type: "FetchExpression",
              url: lexedLine[j + 1].word,
              format: null,
              location: {
                row: i + 1,
                col: lexedLine[j].begin,
              },
            };
            // TODO: to check this or to not check this?
            if (tail && tail?.type === "VarDeclaration") {
              let target = this.AST.body[
                this.AST.body.length - 1
              ] as AST.VarDeclaration;
              target.value = fetchExpr;
              break;
            }
            this.NS[tail.word] = fetchExpr;
            this.AST.body.push(fetchExpr);
            break;
          case Tokens.AS: {
            // cast the expression on LHS as a specific data type
            let dataTypes: Array<string> = Object.values(AST.DataType);
            let fetchFormat: string = lexedLine[j + 1]?.word;
            if (!lexedLine[j + 1] || !dataTypes.includes(fetchFormat)) {
              throw new MQLSyntaxError(
                `AS expects a valid data type got ${
                  lexedLine[j + 1]?.word ?? "none"
                }`,
                line,
                lexedLine[j].end + 2
              );
            }

            if (tail?.value?.type !== "FetchExpression") {
              throw new MQLSyntaxError(
                `AS needs a valid expression to cast`,
                line,
                lexedLine[j].end + 1
              );
            }

            let target = this.AST.body[
              this.AST.body.length - 1
            ] as AST.FetchExpression;
            target.format =
              AST.DataType[fetchFormat as keyof typeof AST.DataType];
            break;
          }
          case Tokens.PIPE: // cast any variable or literal to an output
            if (
              !lexedLine[j + 1] ||
              !(
                lexedLine[j + 1]?.tokenType === TokenType.IDENTIFIER ||
                lexedLine[j + 1]?.tokenType === TokenType.STRING_LITERAL ||
                lexedLine[j + 1]?.tokenType === TokenType.URL_LITERAL
              )
            ) {
              throw new MQLSyntaxError(
                `PIPE needs a valid literal or reference`,
                line,
                lexedLine[j].end + 1
              );
            }

            let pipeExpr: AST.PipeExpression = {
              type: "PipeExpression",
              source: {
                type: lexedLine[j + 1].tokenType,
                value: lexedLine[j + 1].word,
              },
              destination: {
                type: null,
                value: null,
              },
              location: {
                row: i + 1,
                col: lexedLine[j].begin,
              },
            };

            this.AST.body.push(pipeExpr);
            break;
          case Tokens.TO: // cast a PIPE expression to provided output
            if (tail?.type !== "PipeExpression") {
              throw new MQLSyntaxError(
                `TO excepts a valid PIPE expression before`,
                i + 1,
                lexedLine[j].end + 1
              );
            }
            let toOutput = lexedLine[j + 1];
            let toOutputValues: Array<string> = Object.values(AST.DestType);
            if (
              !toOutput ||
              toOutput.tokenType !== TokenType.KEYWORD ||
              !toOutputValues.includes(toOutput.word)
            ) {
              throw new MQLSyntaxError(
                `TO expects a valid destination, got ${
                  toOutput
                    ? `a ${toOutput.tokenType.toLowerCase()} '${toOutput.word}'`
                    : "none"
                }`,
                i,
                lexedLine[j].end + 2
              );
            }

            if (tail?.type !== "PipeExpression") {
              throw new MQLSyntaxError(
                `TO expects a PIPE expression, got ${tail?.type ?? "none"}`,
                i,
                lexedLine[j].begin
              );
            }

            let pipeDestExpr: AST.PipeDestination = {
              type: AST.DestType[toOutput.word as keyof typeof AST.DestType],
              value: null,
            };

            if (pipeDestExpr.type === AST.DestType.EXTERN) {
              if (
                !lexedLine[j + 2] ||
                lexedLine[j + 2]?.tokenType !== TokenType.IDENTIFIER
              )
                throw new MQLSyntaxError(
                  `EXTERN expects a valid identifier found ${
                    lexedLine?.[j + 2]?.tokenType ?? "none"
                  }`,
                  i,
                  lexedLine[j + 1].end
                );

              // the intepreter should handle this instead
              // if (!this.NS?.[lexedLine[j+2].word]) throw new MQLSyntaxError(`EXTERN expected a valid variable, found ${lexedLine[j+2].word}`, i, lexedLine[j+2].begin);

              pipeDestExpr.value = lexedLine[j + 2].word;
            }

            let target = this.AST.body[
              this.AST.body.length - 1
            ] as AST.PipeExpression;
            target.destination = pipeDestExpr;
            break;
          case Tokens.OR: // determines action to do if the expression on LHS fails
            let vals: Array<string> = Object.values(AST.OrType);

            if (
              !lexedLine?.[j + 1] ||
              lexedLine?.[j + 1]?.tokenType !== TokenType.KEYWORD ||
              !vals.includes(lexedLine?.[j + 1].word)
            ) {
              throw new MQLSyntaxError(
                `OR expected a valid handler, found ${
                  lexedLine?.[j + 1].tokenType.toLowerCase() ?? "none"
                }`,
                i,
                lexedLine[j].begin
              );
            }

            if (
              !(
                tail?.value?.type === "FetchExpression" ||
                tail?.type === "FetchExpression" ||
                tail?.type === "PipeExpression"
              )
            ) {
              throw new MQLSyntaxError(
                `OR expected a valid expression to handle, found ${
                  tail?.type ?? "none"
                }`,
                i,
                lexedLine[j].begin
              );
            }
            let orExpr: AST.OrExpression = {
              type: "OrExpression",
              handler:
                AST.OrType[lexedLine[j + 1].word as keyof typeof AST.OrType],
            };

            if (lexedLine[j + 1].word === "EXIT") {
              if (lexedLine[j + 2].tokenType !== TokenType.INT_LITERAL)
                throw new MQLSyntaxError(
                  `EXIT expected a valid INT_LITERAL, found ${
                    lexedLine[j + 2]?.tokenType ?? "none"
                  }`,
                  i,
                  lexedLine[j + 1].end
                );
              orExpr.code = Number(lexedLine[j + 2].word);
            }
            this.AST.body.push(orExpr);
            break;
        }
      }
    }
    return this.AST;
  }
}
