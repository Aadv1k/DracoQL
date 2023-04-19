import eval from './Eval';
import interpreter from './Interpreter';
import parser from "./Parser";
import lexer from "./Lexer";

eval(`
  VAR data = FETCH "https://www.theblock.co/" 
    METHOD "POST"
    BODY JSON "{}"
`);

export {
  interpreter,
  lexer,
  parser,
  eval
};
