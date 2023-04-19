# DracoQL 🐉

DracoQL is a powerful and flexible embeddable query language for processing and transforming large data from the web, databases or even files and piping it to outputs.

**It is still in development but provides a set of modules that can be used to perform operations on data in a structured way.**

## Features

- Simple and intuitive syntax
- Support for most data sources (web, JSON, text)
- Functional error handling

## Get

```shell
npm install dracoql
```

## Usage

```typescript
import draco from "dracoql";

draco.eval(`PIPE "Hello world!" TO STDOUT`);
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
