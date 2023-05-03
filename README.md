# fixgpt

Tool that helps you do mass changes across your codebase

## BEFORE USE!!!

- Before using this tool, make sure you use Git or backup your project somewhere. LLMs are not 100% reliable and it can easily ruin things!
- `init` command creates a local `.fixgpt` folder with config. Make sure to add it to `.gitignore` file of your project

## Installation

Install from NPM:

```bash
npm i fixgpt -g
```

Or just use NPX:

```bash
npx fixgpt <command> <arg1> <arg2>
```

## How to use?

### 1. Initialize using your OpenAI access token

```bash
fixgpt init <openai_token>
```

### 2. Create a template

Create `.md` file somewhere that describes the instruction.

Instruction should have the following format:

```md
# Variables

## [variable_name]

Variable value

# Tasks

## Task name

### Prompt

Modify the code. Remove all occurencies of the word "[variable_name]".

Source:
[input]

Answer with the modified code. Only code, no explanations
```

Example: [**click**](https://github.com/Kelin2025/fixgpt/blob/master/examples/foo.md)

### 3. Run it

Suppose that you want to modify each `index.js` inside `src/perks` folder

Just run this:

```bash
fixgpt run-template ./template.md ./src/perks/**/index.js
```

Then grab some coffee and see it working :)

> **NOTE:** OpenAI doesn't allow running multiple requests in parallel, so if you have like 100 files, it will be slow. It can be cheated by using multiple accounts but currently it's not supported

## TODO

- [ ] Create/remove files API
- [ ] Run without template
- [ ] Take variables from CLI
- [ ] Run another template
- [ ] Support other models (only GPT 3.5 for now)
- [ ] Parallel threads support
