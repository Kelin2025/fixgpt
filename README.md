# fixgpt

Tool that helps you refactor codebase or do some specific tasks using ChatGPT

## How to use?

### 1. Set-token

```bash
npx fixgpt set-token <your_openai_token>
```

### 2. Create a template

Make a `.md` file somewhere that describes the instruction

Example:

```md
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

## Change the structure

### Model

gpt-3.5-turbo

### Prompt

Modify the code. Replace all portions with the following structure to another format

Structure:
[from]

Replacement:
[replacement]

Text:

[input]
```

### 3. Run it

Suppose that you want to modify each `index.js` inside `src/perks` folder

Just run this:

```bash
npx fix-gpt ./template.md ./src/perks/**/index.js
```
