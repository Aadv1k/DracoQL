import DQLInterpreter from "./Interpreter";

import DQLParser from "./Parser";
import DQLLexer from "./Lexer";

type EvalCallback = (interpreter: DQLInterpreter) => void;

export default function (syn: string, callback?: EvalCallback): void {
  const lexer = new DQLLexer(syn);
  const parser = new DQLParser(lexer.lex());
  const interpreter = new DQLInterpreter(parser.parse())
  interpreter.run().then(() => {
    if (callback) {
      callback(interpreter)
    };
  });
}
