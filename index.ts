import DQLLexer from "./src/Lexer";
import DQLParser from "./src/Parser";
import DQLInterpreter from "./src/Interpreter";

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
  const parser = new DQLParser(lexer.lex());
  const interpreter = new DQLInterpreter(parser.parse())
  await interpreter.run();
})();

