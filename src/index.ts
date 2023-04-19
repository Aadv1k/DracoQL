import DQLLexer from "./Lexer";
import MQLParser from "./Parser";
import DQLInterpreter from "./Interpreter";

/*
 *
*/

let str = `
VAR url = https://ap-.up.railway.app/api/login
VAR data = FETCH 
  METHOD "POST" 
  BODY TEXT '{"hello": "world"}'
  https://ap-quillia.up.railway.app/api/login
  AS JSON
  OR EXIT 69
`; 

(async () => {
  const lexer = new DQLLexer(str);
  const parser = new MQLParser(lexer.lex());
  const interpreter = new DQLInterpreter(parser.parse())
  await interpreter.run();
})();

