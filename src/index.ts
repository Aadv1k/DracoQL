import eval from './Eval';
import interpreter from './Interpreter';
import parser from "./Parser";
import lexer from "./Lexer";

eval(`
  VAR data = FETCH "https://api.kanye.rest" 
    AS JSON
  VAR beta = EXTRACT "quote" FROM data AS JSON
`, (ctx) => {
  console.log(ctx.getVar("beta"));
});

export {
  interpreter,
  lexer,
  parser,
  eval
};
