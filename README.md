# DracoQL 🐉

DracoQL is a powerful and flexible embeddable query language for processing and transforming large data from the web, databases or even files and piping it to outputs.

**It is still in development but provides a set of modules that can be used to perform operations on data in a structured way.**

## Features

- Simple and intuitive syntax
- Support for most data sources (web, JSON, text)
- Functional error handling

## Get

```shell
git clone git@github.com:aadv1k/DracoQL
cd DracoQL && npm install
```

## Usage

Currently the language is in development, so you will have to use internal module.

```typescript
import DQLLexer from "./Lexer";
import MQLParser from "./Parser";
import DQLInterpreter from "./Interpreter";

let syntax = `
VAR data = FETCH https://jsonplaceholder.typicode.com/users/1 AS JSON
PIPE data TO FILE "hello.txt"`; 

(async () => {
  const lexer = new DQLLexer(syntax);
  const parser = new MQLParser(lexer.lex());
  const interpreter = new DQLInterpreter(parser.parse())
  await interpreter.run();
})();
```

## Hello world

Although `DracoQL` isn't really meant for that, here is a `hello world`

```
PIPE "hello world!" TO STDOUT
```

## Examples

### Fetch data and log it to the console

```cql
VAR data = FETCH https://jsonplaceholder.typicode.com/posts 
  AS JSON 
  OR DIE // exit if data is not valid JSON

PIPE title TO STDOUT
```

### Fetch data and put it to file

```cql
VAR data = FETCH https://jsonplaceholder.typicode.com/users/1 
  AS JSON 
  OR DIE // exit if data is not valid JSON

PIPE data TO FILE "user.json" 
```

<!--
### Scrape data from a website 

```
VAR bloomberg_data = GET URL https://www.bloomberg.com/asia AS HTML
VAR headline = EXTRACT /html/body/div[3]/main/section[1]/section/section/article/section/a FROM bloomberg_data
PIPE headline 
  TO FILE headline.txt
  TO STDOUT
```
-->
