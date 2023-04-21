import Parser from '../src/Parser';
import Lexer from '../src/Lexer';

import { TokenType, Lex } from '../src/types/lexer';
import {
  ASTDocument,
  FetchExpression,
  VarDeclaration,
  DataType,
  Namespace,
} from '../src/types/ast';

describe('DQLParser', () => {
  it('should parse lexed input into ASTDocument', () => {
    const expectedAST: ASTDocument = {
      type: 'Program',
      body: [],
    };

    let l = new Lexer("");
    let p = new Parser(l.lex())

    const parsedAST = p.parse();
    expect(parsedAST).toEqual(expectedAST);
  });
});
