#!/usr/bin/env node
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { refactor } = require("./core/refactor");

const config_path = path.join(__dirname, ".fixgpt/config.json");

fse.ensureFileSync(config_path);

const argv = yargs(hideBin(process.argv))
  .command("set-token <token>", "Set OpenAI token", {}, async (argv) => {
    const { token } = argv;
    fs.writeFileSync(config_path, JSON.stringify({ token }));
  })
  .command(
    "run <template_name> <files_glob>",
    "Run refactoring helper",
    {},
    async (argv) => {
      const { template_name, files_glob } = argv;
      const { token } = fse.readJsonSync(config_path, "utf-8");
      if (!token) {
        console.error("No token found. Run `npx fixgpt token <token>` first");
        process.exit(1);
      }
      await refactor(token, template_name, files_glob);
    }
  )
  .demandCommand(2)
  .strict()
  .help().argv;
