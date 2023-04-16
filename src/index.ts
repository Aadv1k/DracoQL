import MQLLexer from "./Lexer";
import MQLParser from "./Parser";

let str = `VAR hello = "hello"`; 

const lexer = new MQLLexer(str);
const tokens = lexer.lex();
const parser = new MQLParser(tokens);
parser.parse();
