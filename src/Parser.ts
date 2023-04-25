import { Tokens, Lex, TokenType } from "./types/lexer";
import * as AST from "./types/ast";
import * as Lexer from "./types/lexer";
import { DQLSyntaxError, DQLReferenceError } from "./Exceptions";

export default class DQLParser {
  private lexedInput: Lex;
  private ENS: any;
  private AST: AST.ASTDocument;

  constructor(lexedInput: Lex, NS?: AST.Namespace) {
    this.lexedInput = lexedInput;
    this.ENS = {
      ...NS,
    };
    this.AST = {
      type: "Program", // TODO: determine where the evaluater is run from
      body: [],
    };
  }

  private findToken(
    line: number,
    t: TokenType,
    start?: number
  ): Lexer.Token | undefined {
    for (let i = line - 1; i < this.lexedInput.length - 1; i++) {
      for (let j = start ?? 0; j < this.lexedInput[i][1].length; j++) {
        if (this.lexedInput[i][1][j].tokenType === t) {
          return this.lexedInput[i][1][j];
        }
      }
    }

    return undefined;
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
              throw new DQLSyntaxError(
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
              value: null,
            };
            this.ENS[literal.word] = null;
            this.AST.body.push(varDecl);
            break;
          case Tokens.EQUALTO: {
            if (
              lexedLine[j + 1]?.tokenType === TokenType.OPERATOR ||
              !lexedLine[j + 1]
            ) {
              throw new DQLSyntaxError(
                `expected LHS declaration, got ${
                  lexedLine[j + 1]?.tokenType.toLowerCase() ?? "none"
                }`,
                line,
                lexedLine[j].end + 2
              );
            }
            if (
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
              this.ENS[target.identifier] = lexedLine[j + 1].word;
            }

            break;
          }
          case Tokens.FETCH: //  fetch a URL_LITERAL
            if (!lexedLine[j + 1]) {
              throw new DQLSyntaxError(
                "FETCH expected to find a valid identifier or URL, found none",
                i,
                lexedLine[j].begin
              );
            }

            let targetUrl;

            if (lexedLine[j + 1].tokenType === TokenType.IDENTIFIER) {
              if (!this.ENS[lexedLine[j + 1].word])
                throw new DQLReferenceError(
                  `unable to find variable ${lexedLine[j + 1]?.word ?? ""}`
                );
              targetUrl = this.ENS[lexedLine[j + 1].word];
            } else if (
              lexedLine[j + 1].tokenType === TokenType.STRING_LITERAL
            ) {
              targetUrl = lexedLine[j + 1].word;
            }

            let fetchExpr: AST.FetchExpression = {
              type: "FetchExpression",
              url: targetUrl,
              format: null,
              meta: {},
              location: {
                row: i + 1,
                col: lexedLine[j].begin,
              },
            };

            if (tail && tail?.type === "VarDeclaration") {
              let target = this.AST.body[
                this.AST.body.length - 1
              ] as AST.VarDeclaration;
              target.value = fetchExpr;
              break;
            }
            this.AST.body.push(fetchExpr);
            break;
          case Tokens.METHOD: {
            if (!tail || tail?.type !== "VarDeclaration") {
              if (tail?.value?.type !== "FetchExpression")
                throw new DQLSyntaxError(
                  "METHOD expected a valid FETCH expression",
                  i,
                  lexedLine[j].begin
                );
            }

            if (lexedLine[j + 1].tokenType !== TokenType.STRING_LITERAL)
              throw new DQLSyntaxError(
                `METHOD expected a string literal got ${
                  lexedLine[j + 1]?.tokenType ?? "none"
                }`,
                i,
                lexedLine[j].begin
              );
            let target = this.AST.body[
              this.AST.body.length - 1
            ] as AST.VarDeclaration;
            let targetFetchExpr = target.value as AST.FetchExpression;

            targetFetchExpr.meta = {
              ...targetFetchExpr.meta,
              method: lexedLine[j + 1].word,
            };
            break;
          }

          case Tokens.HEADER: {
            if (!tail || tail?.type !== "VarDeclaration") {
              if (tail?.value?.type !== "FetchExpression")
                throw new DQLSyntaxError(
                  "HEADER expected a valid FETCH expression",
                  i,
                  lexedLine[j].begin
                );
            }

            let headersKp = lexedLine[j + 1].word
              .split(":")
              .map((e) => e?.trim());

            if (lexedLine[j + 1]?.tokenType !== TokenType.STRING_LITERAL)
              throw new DQLSyntaxError(
                `HEADER expected a string literal got ${
                  lexedLine[j + 1]?.tokenType ?? "none"
                }`,
                i,
                lexedLine[j].begin
              );
            //if (headersKp.length !== 2) throw new DQLSyntaxError(`invalid HEADER format ${lexedLine[j+1].word}`, i, lexedLine[j].begin);

            let target = this.AST.body[
              this.AST.body.length - 1
            ] as AST.VarDeclaration;

            let targetFetchExpr = target.value as AST.FetchExpression;

            let headers = {
              ...(targetFetchExpr?.meta?.headers ?? {}),
            };
            headers[headersKp[0]] = headersKp[1];
            targetFetchExpr.meta = {
              ...targetFetchExpr.meta,
              headers,
            };
            break;
          }

          case Tokens.BODY: {
            if (!tail || tail?.type !== "VarDeclaration") {
              if (tail?.value?.type !== "FetchExpression")
                throw new DQLSyntaxError(
                  "BODY expected a valid FETCH expression",
                  i,
                  lexedLine[j].begin
                );
            }

            let bodyType = lexedLine[j + 1];
            let bodyData = lexedLine[j + 2];

            if (bodyData?.tokenType !== TokenType.STRING_LITERAL)
              throw new DQLSyntaxError(
                `BODY expected a valid data as string literal got ${
                  bodyData?.tokenType ?? "none"
                }`,
                i,
                lexedLine[j].begin
              );

            let vals: Array<string> = Object.values(AST.BodyType);
            if (!vals.includes(bodyType.word))
              throw new DQLSyntaxError(
                `BODY expected a valid data type got ${
                  bodyType?.tokenType ?? "none"
                }`,
                i,
                lexedLine[j].begin
              );

            let target = this.AST.body[
              this.AST.body.length - 1
            ] as AST.VarDeclaration;

            let targetFetchExpr = target.value as AST.FetchExpression;
            targetFetchExpr.meta = {
              ...targetFetchExpr.meta,
              body: {
                type: AST.BodyType[bodyType.word as keyof typeof AST.BodyType],
                value: bodyData.word,
              },
            };
            break;
          }

          case Tokens.EXTRACT: {
            if (
              !lexedLine[j + 1] ||
              lexedLine[j + 1].tokenType !== TokenType.STRING_LITERAL
            ) {
              throw new DQLSyntaxError(
                "EXTRACT expects a string",
                i,
                lexedLine[j].end
              );
            }

            const extractExpr: AST.ExtractExpression = {
              type: "ExtractExpression",
              from: null,
              what: lexedLine[j + 1].word,
              location: {
                row: i,
                col: lexedLine[j].begin,
              },
            };

            if (
              tail &&
              tail?.type === "VarDeclaration" &&
              Object.keys(tail?.value ?? {}).length === 0
            ) {
              let target = this.AST.body[
                this.AST.body.length - 1
              ] as AST.VarDeclaration;
              target.value = extractExpr;

              break;
            }

            this.AST.body.push(extractExpr);
            break;
          }
          case Tokens.FROM: {
            if (
              !lexedLine[j + 1] ||
              (lexedLine[j + 1]?.tokenType !== TokenType.STRING_LITERAL &&
                lexedLine[j + 1]?.tokenType !== TokenType.IDENTIFIER)
            ) {
              throw new DQLSyntaxError(
                `FROM expects a valid extraction type got ${
                  lexedLine[j + 1]?.tokenType ?? "none"
                }`,
                line,
                lexedLine[j].end + 2
              );
            }

            if (
              tail?.type !== "VarDeclaration" &&
              tail?.type !== "ExtractExpression"
            ) {
              throw new DQLSyntaxError(
                "FROM expects a valid VAR or EXTRACT expression",
                i,
                lexedLine[j].end
              );
            }

            if (tail && tail?.type === "VarDeclaration") {
              let target = this.AST.body[
                this.AST.body.length - 1
              ] as AST.VarDeclaration;
              let t = target.value as AST.ExtractExpression;
              t.from = {
                type: lexedLine[j + 1].tokenType, // TODO this may change
                value: lexedLine[j + 1].word,
              };
              break;
            }

            let target = this.AST.body[
              this.AST.body.length - 1
            ] as AST.ExtractExpression;

            target.from = {
              type: lexedLine[j + 1].tokenType, // TODO this may change
              value: lexedLine[j + 1].word,
            };
            break;
          }

          case Tokens.AS: {
            // cast the expression on LHS as a specific data type
            let dataTypes: Array<string> = Object.values(AST.DataType);
            let fetchFormat: string = lexedLine[j + 1]?.word;
            if (!lexedLine[j + 1] || !dataTypes.includes(fetchFormat)) {
              throw new DQLSyntaxError(
                `AS expects a valid data type got ${
                  lexedLine[j + 1]?.word ?? "none"
                }`,
                line,
                lexedLine[j].end + 2
              );
            }

            if (
              !["FetchExpression", "ExtractExpression"].includes(
                tail?.value?.type ?? tail.type
              )
            ) {
              throw new DQLSyntaxError(
                `AS needs a valid expression to cast`,
                line,
                lexedLine[j].end + 1
              );
            }

            let target = this.AST.body[
              this.AST.body.length - 1
            ] as AST.VarDeclaration;

            let fetchTarget = target.value as any;
            fetchTarget.format =
              AST.DataType[fetchFormat as keyof typeof AST.DataType];

            this.AST.body[this.AST.body.length - 1] = target;
            break;
          }
          case Tokens.PIPE: // cast any variable or literal to an output
            if (
              !lexedLine[j + 1] ||
              !(
                lexedLine[j + 1]?.tokenType === TokenType.IDENTIFIER ||
                lexedLine[j + 1]?.tokenType === TokenType.STRING_LITERAL
              )
            ) {
              throw new DQLSyntaxError(
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
              throw new DQLSyntaxError(
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
              throw new DQLSyntaxError(
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
              throw new DQLSyntaxError(
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
                throw new DQLSyntaxError(
                  `EXTERN expects a valid identifier found ${
                    lexedLine?.[j + 2]?.tokenType ?? "none"
                  }`,
                  i,
                  lexedLine[j + 1].end
                );

              pipeDestExpr.value = lexedLine[j + 2].word;
            } else if (pipeDestExpr.type === AST.DestType.FILE) {
              if (
                !lexedLine[j + 2] ||
                lexedLine[j + 2]?.tokenType !== TokenType.STRING_LITERAL
              )
                throw new DQLSyntaxError(
                  `FILE expects a valid file path found ${
                    lexedLine?.[j + 2]?.tokenType ?? "none"
                  }`,
                  i,
                  lexedLine[j + 1].end
                );
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
              throw new DQLSyntaxError(
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
              throw new DQLSyntaxError(
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
                throw new DQLSyntaxError(
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
          case Tokens.EXTERN:
            if (
              !lexedLine[j + 1] ||
              lexedLine[j + 1]?.tokenType !== TokenType.IDENTIFIER
            ) {
              throw new DQLSyntaxError(
                `EXTERN expects a valid identifier, got ${
                  lexedLine[j + 1]?.tokenType ?? "none"
                }`,
                i,
                lexedLine[j].end
              );
            }
            break;
        }
      }
    }
    return this.AST;
  }
}
