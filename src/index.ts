import MQLLexer from "./Lexer";
import MQLParser from "./Parser";
import MQLInterpreter from "./Interpreter";


//
//VAR data = FETCH url AS JSON
//OR DIE 
let str = `
PIPE "foo" TO STDOUT
`; 

(async () => {
  const lexer = new MQLLexer(str);
  const parser = new MQLParser(lexer.lex());
  const interpreter = new MQLInterpreter(parser.parse())
  await interpreter.run();
})();

