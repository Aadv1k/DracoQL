# DracoQL 
  
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=&logo=typescript&logoColor=white)
[![NPM](https://badge.fury.io/js/dracoql.svg)](https://npm.im/dracoql)

DracoQL is a query language that tries to **aggresively simplify JavaScript networking calls to expressive human-readable statements**

here is a crude demonstration

```CQL
FETCH data FROM "http://api.kanye.rest/" AS JSON 
  OR DIE
```

and the JavaScript code equivalent 

```js
try {
    const res = await fetch("http://api.kanye.rest/");
    const data = await res.json()
} catch { /* do something * / }
```

## Why?

At the time I was building [propelr](https://github.com/aadv1k/propelr) and needed to store a customizable "network" workflow, eg 

> Fetch resource A from B, extract "X" from A and post x to C

I decided not to use an object or class because they are inflexible and result in many unused fields. Instead, I chose DracoQL which allows me to store queries as text in a database and interpret at runtime. This approach is a lot more elegant and portable

## Documentation

- [Install](#install)
- [Usage](#usage)
- [Tutorial](#syntax)
  - [Variables](#variables)
  - [Networking](#networking)
    - [Fetch](#fetch-response)
    - [Fetch HTML](#fetch-html)
    - [Fetch JSON](#fetch-json)
    - [Caching response](#caching-html)
    - [Headless mode](#headless-html-mode)
  - [Piping](#piping)
  - [Extraction](#extraction)
- [Examples](#examples)
- [API reference](#api)


## Install

```shell
npm install dracoql
```

## Usage

```typescript
import * as draco from "dracoql";

draco.eval(`PIPE "Hello world!" TO STDOUT`);
```

Additionally, you can get runtime variables from the caller

```typescript
import * as draco from "dracoql";

draco.eval(`VAR data = FETCH https://jsonplaceholder.typicode.com/todos/ AS JSON`, (ctx) => {
  console.log(ctx.getVar("data"))
});
```
## Syntax

### Variables

A variable can hold either an `INT_LITERAL`, `STRING_LITERAL` or an expression. Draco does not support string escaping, you can instead use `''` for that.

```cql
VAR foo = 1
VAR bar = "hello world!"
VAR baz = FETCH "https://example.org"
```
### Networking

Draco provides `FETCH` as the primary method for interacting with a url

#### Fetch Response

```cql
VAR data = FETCH "https://example.org"
      HEADER "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0"
      HEADER "Content-type: application/json"
      METHOD "GET"
```

Here the `data` variable will hold a request object, which looks like so

```typescript
{
  headers: any,
  status: number,
  redirected: boolean
  url: string
}
```

Additionaly, you can also make POST requests

```cql
VAR data = FETCH "https://reqres.in/api/users" METHOD "POST"
  HEADER "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0"
  HEADER "Content-type: application/json"
  BODY JSON '{"name": "morpheus", "job": "leader"}'
```

#### Fetch JSON

```cql
VAR data = FETCH "https://reqres.in/api/users" 
  HEADER "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0"
  AS JSON
```

here `data` will be stored as the parsed JSON object

#### Fetch HTML

```cql
VAR data = FETCH "https://reqres.in" 
  HEADER "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0"
  AS HTML
```

here `data` will be stored as the parsed HTML object, which looks like so

```typescript
{
  tag: string,
  attributes: any,
  children: [...]
}
```

#### Caching HTML

Addtionally draco also has a `CACHE` keyword which requires an time in milliseconds and optional path for `html-cache` directory

Here is example usage. NOTE Caching only works with HTML data type

```cql
VAR data = FETCH "https://example.org"
  CACHE 10000
  AS HTML
```
#### Headless HTML mode

To scrap HTML from SPAs Draco offers an optinal `HEADLESS` flag, which when enabled will use puppeteer to load and fetch the html page.

```cql
VAR data = FETCH "https://bloomberg.com"
  CACHE 6e5
  AS HTML HEADLESS
```

### Piping

To extract data out of the evaluater, you can use the `PIPE` keyword

```
PIPE "hello world" TO STDOUT
```

you can also output data to a file

```
PIPE "Draco was here" TO FILE "draco.txt"
```

### Extraction

Draco provides in-built support for parsing HTML selectors and JSON queries

```cql
VAR res = FETCH "https://reqres.in/api/users" AS JSON
VAR data = EXTRACT "data.0.id" FROM res
PIPE data TO STDOUT
```

```cql
VAR res = FETCH "https://reqres.in" AS HTML
VAR headline = EXTRACT "h2.tagline:nth-child(1)" FROM res
PIPE headline TO STDOUT
```

## Examples

### Fetch data and log it to the console

```cql
VAR data = FETCH "https://www.cs.cmu.edu/afs/cs/project/ai-repository/ai/areas/nlp/corpora/names/male.txt"
PIPE title TO STDOUT
```

### Fetch data, handle error and put it to file

```cql
VAR data = FETCH "https://jsonplaceholder.typicode.com/users/1"
  AS JSON 
  OR DIE 

PIPE data TO FILE "user.json" 
```

### Scrape data from a website and cache it

```cql
VAR data = FETCH "https://www.cnet.com/" 
    HEADER "User-Agent: My user agent"
    CACHE 6e5
    AS HTML

VAR headline = EXTRACT 
  ".c-pageHomeHightlights>div:nth-child(1)>div:nth-child(2)>div:nth-child(1)>a:nth-child(1)>div:nth-child(1)>div:nth-child(2)>div:nth-child(1)>h3:nth-child(1)>span:nth-child(1)"
  FROM data

VAR txt = EXTRACT "children.0.text" FROM headline 
  AS JSON

PIPE txt TO STDOUT
```

## API

module draco, exports the lexer, interpreter and an parser.

```typescript
import * as draco from "dracoql";

const lexer = new draco.lexer(`PIPE "hello world" TO STDOUT`);
const parser = new draco.parser(lexer.lex());
const interpreter = new draco.interpreter(parser.parse());

(async () => {
  await interpreter.run();
})()
```

## Support

If you liked the project, give it a star! it's good to see feedback and appreciation from strangers. If you would like to suggest a feature then raise an issue.

Image is taken from Dall-E



