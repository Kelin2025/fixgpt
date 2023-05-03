#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { parseMarkdown } = require("./core/parse-markdown");

const argv = yargs(hideBin(process.argv))
  .usage("Usage: $0 <file>")
  .demandCommand(1, "Please provide a Markdown file to parse.").argv;

const filePath = path.resolve(argv._[0]);
const markdownText = fs.readFileSync(filePath, "utf8");
const parsedJson = parseMarkdown(markdownText);

console.dir(parsedJson, { depth: 5 });
