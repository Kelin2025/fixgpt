#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const openai = require("openai");
const { refactor } = require("./core/refactor");

// Replace with your API key
openai.apiKey = "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";

const argv = yargs(hideBin(process.argv))
  .command(
    "run <template_name> <files_glob>",
    "Run refactoring helper",
    {},
    async (argv) => {
      const { template_name, files_glob } = argv;
      await refactor(template_name, files_glob);
    }
  )
  .demandCommand(1)
  .strict()
  .help().argv;
