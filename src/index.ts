import MQLLexer from "./Lexer";
import MQLParser from "./Parser";

let str = `
VAR data = FETCH https://api.kanye.rest AS JSON
   OR EXIT 1
`; 

const lexer = new MQLLexer(str);
const tokens = lexer.lex();
const parser = new MQLParser(tokens);
parser.parse();
