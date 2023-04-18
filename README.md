# MoleQL ⛏️

MoleQL is a TypeScript-based embeddable DSL for web scraping and data manipulation with tooling to pull data from files, web or databas and pipe it to different sources.

## Features

- Simple and intuitive syntax
- Support for most data sources (web, JSON, text)
- Functional error handling

## Hello world

Although `MoleQL` isn't really meant for that, here is a `hello world`

```
PIPE "hello world!" TO STDOUT
```

## Examples

### Fetch data and log it to the console

```
VAR data = FETCH https://jsonplaceholder.typicode.com/posts 
  AS JSON 
  OR DIE // exit if data is not valid JSON

VAR title = data[0].title
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
