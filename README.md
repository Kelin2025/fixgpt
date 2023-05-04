# fixgpt

Tool that helps you do mass changes across your codebase

- Create new files
- Mass refactoring
- Remove files upon certain conditions
- Code execution

## Watch a demo

- Code generation - [**link**](https://www.loom.com/share/78f5874842c9438bb18042cfd8f75e4f)
- Mass Update - [**link**](https://www.loom.com/share/c8a44ba7d0c34d0c87fd8991556814c2)
- Parameters - [**link**](https://www.loom.com/share/582d4e86967c4637abe27157064ba99d)

## Installation

Install from NPM:

```bash
npm i fixgpt -g
```

Or just use NPX:

```bash
npx fixgpt <command> <arg1> <arg2>
```

## Before use

`fixgpt` will go over your files and will edit them according your request.

It is recommeneded to use GIT (or other VCS) and check the diff of changes yourself, once `fixgpt` is done.

It is necessary as LLM models are not 100% safe at producing reliable code.

## How to use?

### 1. Initialize using your OpenAI access token

```bash
fixgpt init <openai_token>
```

`init` command creates a local `.fixgpt` folder with config.

> **CAUTION:** Make sure to add it to `.gitignore` file of your project in order to not leak your API keys

### 2. Create a template

```bash
fixgpt create-template ./template.md
```

This will create a Markdown file with a template which then can be used in `run-template` command

### 3. Run it

```bash
fixgpt run-template ./template.md
```

Then grab some coffee and see it working :)

> **NOTE:** OpenAI doesn't allow running multiple requests in parallel, so if you have like 100 files, it will be slow. It can be cheated by using multiple accounts but currently it's not supported

## PRO Stuff

### Tokens

You can put specific tokens into a template in order to ask for some data or use previous responses.

- `[[args.input.ArgumentName]]` - asks for `ArgumentName` **before** execution
- `[[ask.input.ArgumentName]]` - asks for `ArgumentName` **during** execution (unlike the previous one, this one will be asked separately for each file in "Mass Update")
- `[[responses.0.code]]` - code from task response (where `0` is an index of the task)
- `[[responses.0.file]]` - filename from task (where `0` is an index of the task)

## TODO

- [x] Create/remove files API
- [x] Take variables from CLI
- [ ] Run without template
- [ ] Run another template
- [ ] Support other models (only GPT 3.5 for now)
- [ ] Parallel threads support

## Support

[![Buy Me a Coffee](https://storage.ko-fi.com/cdn/kofi2.png?v=3)](https://ko-fi.com/M4M3KZ70G)
