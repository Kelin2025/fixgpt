# Variables

## [from]

```
{ "id": "test", name: "Bar" }
```

## [replacement]

```
const id = "test"
const name = "Bar"
const icon = null
```

# Tasks

## Search

### Model

gpt-3.5-turbo

### Prompt

Modify the code. Replace all portions with the following structure to another format

Structure:
[from]

Replacement:
[replacement]

Text:

```
[input]
```

Answer with the modified code. Only code, no explanations

## Put it below

### Prompt

Find all portions with the following structure and move them to the end of the code

Structure:
[replacement]

Code:

```
[input]
```