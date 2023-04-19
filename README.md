# DracoQL 🐉

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=&logo=typescript&logoColor=white)
[![NPM](https://badge.fury.io/js/dracoql.svg)](https://npm.im/dracoql)


DracoQL is a an embeddable query language for processing and transforming data from the web resources and writing it to files and databases.

**Language actively in development, please report any bugs under [issues](https://github.com/aadv1k/dracoql/issues).**

## Get

```shell
npm install dracoql
```

## Usage

```typescript
import draco from "dracoql";

draco.eval(`PIPE "Hello world!" TO STDOUT`);
```

Additionally, you can get runtime variables from the caller

```typescript
import draco from "dracoql";

draco.eval(`VAR data = FETCH https://jsonplaceholder.typicode.com/todos/ AS JSON`, (ctx) => {
  console.log(ctx.getVar("data"))
});
```

## Examples

### Fetch data and log it to the console

```cql
VAR data = FETCH https://www.cs.cmu.edu/afs/cs/project/ai-repository/ai/areas/nlp/corpora/names/male.txt
PIPE title TO STDOUT
```

### Fetch data and put it to file

```cql
VAR data = FETCH https://jsonplaceholder.typicode.com/users/1 
  AS JSON 
  OR DIE 

PIPE data TO FILE "user.json" 
```

### Scrape data from a website 

```cql
VAR data = FETCH https://www.cnet.com/

VAR headline = EXTRACT 
  .c-pageHomeHightlights>div:nth-child(1)>div:nth-child(2)>div:nth-child(1)>a:nth-child(1)>div:nth-child(1)>div:nth-child(2)>div:nth-child(1)>h3:nth-child(1)>span:nth-child(1) 
  FROM data 
  AS HTML

VAR txt = EXTRACT innerText FROM headline 
  AS JSON

PIPE txt TO STDOUT
```
