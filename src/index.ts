import DQLLexer from "./Lexer";
import DQLParser from "./Parser";
import DQLInterpreter from "./Interpreter";

let str = `
VAR data = FETCH https://dummyjson.com/products/2
VAR quote = EXTRACT images[0] FROM data AS JSON
PIPE quote TO STDOUT
`; 

(async () => {
  const lexer = new DQLLexer(str);
  const parser = new DQLParser(lexer.lex());
  const interpreter = new DQLInterpreter(parser.parse())
  await interpreter.run();
})();

