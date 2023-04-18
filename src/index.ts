import DQLLexer from "./Lexer";
import MQLParser from "./Parser";
import DQLInterpreter from "./Interpreter";


//
//VAR data = FETCH url AS JSON
//OR DIE 
let str = `
PIPE "foo" TO STDOUT // hello world
`; 

(async () => {
  const lexer = new DQLLexer(str);
  const parser = new MQLParser(lexer.lex());
  const interpreter = new DQLInterpreter(parser.parse())
  await interpreter.run();
})();

