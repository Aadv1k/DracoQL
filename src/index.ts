import MQLLexer from "./Lexer";
import MQLParser from "./Parser";
import MQLInterpreter from "./Interpreter";


let str = `
VAR url = https://www.cs.cmu.edu/afs/cs/project/ai-repository/ai/areas/nlp/corpora/names/male.txt
VAR data = FETCH url AS TEXT
   OR EXIT 1
PIPE data TO EXTERN hello
`; 

(async () => {
  const lexer = new MQLLexer(str);
  const parser = new MQLParser(lexer.lex());
  const interpreter = new MQLInterpreter(parser.parse())

  await interpreter.run();
  console.log(interpreter.getVar("data"));
})();

