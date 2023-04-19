import DQLLexer from "./Lexer";
import DQLParser from "./Parser";
import DQLInterpreter from "./Interpreter";

let str = `
VAR bloomberg_data = FETCH https://www.livemint.com
  HEADER "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0"

VAR query = EXTRACT #headline_11681890369118
  FROM bloomberg_data 
  AS HTML

VAR title = EXTRACT innerText FROM query AS JSON

PIPE title TO STDOUT
`; 

(async () => {
  const lexer = new DQLLexer(str);
  const parser = new DQLParser(lexer.lex());
  const interpreter = new DQLInterpreter(parser.parse())
  await interpreter.run();
})();

