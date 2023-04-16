# MoleQL ⛏️

MoleQL is a TypeScript-based DSL for web scraping and data manipulation with tooling to pull data from files, web or databas and pipe it to different sources.

## Features

- Simple and intuitive syntax
- Static typing for better type safety
- Support for most data sources (web, JSON, text)
- Error handling for robustness
- Integration with other languages

## Hello world

```
PIPE "hello world!" TO STDOUT
```

## Examples

### Fetch data and log it to the console

```
VAR data = GET URL https://jsonplaceholder.typicode.com/posts 
  AS JSON 
  OR DIE // exit if data is not valid JSON

VAR title = DATA[0].title
PIPE title TO STDOUT
```

### Scrape data from a website 

```
VAR bloomberg_data = GET URL https://www.bloomberg.com/asia AS HTML
VAR headline = EXTRACT /html/body/div[3]/main/section[1]/section/section/article/section/a FROM bloomberg_data
PIPE headline 
  TO FILE headline.txt
  TO STDOUT
```

