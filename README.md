# fixgpt

Tool that helps you do mass changes across your codebase

## BEFORE USE!!!

- Before using this tool, make sure you use Git or backup your project somewhere. LLMs are not 100% reliable and it can easily ruin things!
- `set-token` command creates a local `.fixgpt` folder with config. Make sure to add it to `.gitignore` file of your project

## How to use?

### 1. Set-token

```bash
npx fixgpt set-token <your_openai_token>
```

### 2. Create a template

Make a `.md` file somewhere that describes the instruction

Instruction example: [**click**](https://github.com/Kelin2025/fixgpt/blob/master/examples/foo.md)

### 3. Run it

Suppose that you want to modify each `index.js` inside `src/perks` folder

Just run this:

```bash
npx fix-gpt ./template.md ./src/perks/**/index.js
```
