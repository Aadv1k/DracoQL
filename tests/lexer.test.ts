import DQLLexer from "../src/Lexer";
import { DQLSyntaxError } from "../src/Exceptions";
import { TokenType } from "../src/types/lexer";

describe("Lexer", () => {
  it("Should correctly tokenize and handle STRING_LITERAL", () => {
    const lexer = new DQLLexer("");
    const tokens = lexer.lexLine('VAR foo = "bar"');

    const expectedTokens = [
      { word: 'VAR', begin: 0, end: 2, tokenType: TokenType.KEYWORD },
      { word: 'foo', begin: 4, end: 6, tokenType: TokenType.IDENTIFIER },
      { word: '=', begin: 8, end: 8, tokenType: TokenType.OPERATOR },
      { word: 'bar', begin: 11, end: 13, tokenType: TokenType.STRING_LITERAL },
    ];
    expect(tokens).toEqual(expectedTokens);
  })

  it("Should handle INT_LITERAL", () => {
    const lexer = new DQLLexer("");
    const tokens1 = lexer.lexLine('VAR num = 42');
    const expectedTokens1 = [
      { word: 'VAR', begin: 0, end: 2, tokenType: TokenType.KEYWORD },
      { word: 'num', begin: 4, end: 6, tokenType: TokenType.IDENTIFIER },
      { word: '=', begin: 8, end: 8, tokenType: TokenType.OPERATOR },
      { word: '42', begin: 10, end: 11, tokenType: TokenType.INT_LITERAL },
    ];
    expect(tokens1).toEqual(expectedTokens1);
  })


  it("Should throw an syntax error when \"\" not terminated", () => {
    const lexer = new DQLLexer('VAR str = "hello');
    expect(() => lexer.lexLine('VAR str = "hello')).toThrow(DQLSyntaxError);
  })
})
