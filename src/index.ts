import eval from "./Eval";
import interpreter from "./Interpreter";
import parser from "./Parser";
import lexer from "./Lexer";

const query = `
VAR foo = FETCH 'http://reddit.com/r/askreddit.json' 
    HEADER "User-agent: bot by u/foo"
    METHOD "GET"
AS TEXT 

PIPE foo TO STDOUT
`


eval(query, (ctx) => {
  console.log(ctx);
});

export {
  interpreter,
  lexer,
  parser,
  eval
};
