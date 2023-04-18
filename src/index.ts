import DQLLexer from "./Lexer";
import MQLParser from "./Parser";
import DQLInterpreter from "./Interpreter";


let str = `
VAR data = FETCH https://jsonplaceholder.typicode.com/users/1 AS JSON
PIPE data TO FILE "hello.txt"

`; 

(async () => {
  const lexer = new DQLLexer(str);
  const parser = new MQLParser(lexer.lex());
  const interpreter = new DQLInterpreter(parser.parse())
  await interpreter.run();
})();

