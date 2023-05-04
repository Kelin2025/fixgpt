#!/usr/bin/env node
import fs from "fs";
import fse from "fs-extra";
import path from "path";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { input, confirm, editor, select } from "@inquirer/prompts";

import { refactor } from "./core/refactor.js";

const config_path = path.join(".fixgpt/config.json");

fse.ensureFileSync(config_path);

const argv = yargs(hideBin(process.argv))
  .command("init <token>", "Initialize with OpenAI token", {}, async (argv) => {
    const { token } = argv;
    fs.writeFileSync(config_path, JSON.stringify({ token }));
  })
  .command("run", "Run tasks without template", {}, async (argv) => {
    // Read token
    const { token } = fse.readJsonSync(config_path, "utf-8");
    if (!token) {
      console.error("No token found. Run `npx fixgpt token <token>` first");
      process.exit(1);
    }

    // Generate template
    const template = await generateTemplate({
      shouldAskForTaskName: false,
    });

    await refactor(token, template);
  })
  .command(
    "create-template <template_name>",
    "Answer simple questions to generate a template",
    {},
    async (argv) => {
      const { template_name } = argv;
      const content = await generateTemplate({
        shouldAskForTaskName: true,
      });

      fs.writeFileSync(template_name, content);
    }
  )
  .command(
    "run-template <template_name>",
    "Run tasks from a template",
    {},
    async (argv) => {
      const { template_name } = argv;

      // Read token
      const { token } = fse.readJsonSync(config_path, "utf-8");
      if (!token) {
        console.error("No token found. Run `npx fixgpt token <token>` first");
        process.exit(1);
      }

      // Read template
      const templatePath = path.join(template_name);
      if (!fs.existsSync(templatePath)) {
        console.error(`Template '${template_name}' not found.`);
        process.exit(1);
      }
      let template = fs.readFileSync(templatePath, "utf8");

      // Ask for initial arguments
      const argsRegexp = /\[\[args\.([A-z0-9-_]+)\.([A-z0-9-_]+)\]\]/g;
      const args = [...template.matchAll(argsRegexp)];
      const alreadyAsked = [];
      for (const match of args) {
        const [string, type, name] = match;
        if (!alreadyAsked.includes(name)) {
          template = template.replaceAll(
            string,
            await input({ message: name })
          );
        }
        alreadyAsked.push(name);
      }

      await refactor(token, template);
    }
  )
  .demandCommand(2)
  .strict()
  .help().argv;

async function generateTemplate({ shouldAskForTaskName }) {
  let content = "# Tasks\n\n";
  let isAskingForTasks = true;
  let taskIdx = 0;
  while (isAskingForTasks) {
    const task = shouldAskForTaskName
      ? await input({ message: "Enter task name" })
      : `Task ${taskIdx++}`;
    const action = await select({
      message: "Action type",
      choices: [
        { value: "Read" },
        { value: "Create" },
        { value: "Update" },
        { value: "Mass Update" },
        { value: "Remove" },
        { value: "Mass Remove" },
        { value: "Evaluate" },
      ],
    });

    content += `## ${task}\n\n`;
    content += `### Action\n${action}\n\n`;

    switch (action) {
      case "Read": {
        const file = await input({ message: "File path" });
        content += `### File\n${file}\n\n`;
        break;
      }
      case "Create": {
        const file = await input({ message: "File path" });
        content += `### File\n${file}\n\n`;
        const prompt = await editor({ message: "Prompt" });
        content += `### Prompt\n${prompt}\n\n`;
        break;
      }
      case "Update": {
        const file = await input({ message: "File path" });
        content += `### File\n${file}\n\n`;
        const prompt = await editor({ message: "Prompt" });
        content += `### Prompt\n${prompt}\n\n`;
        break;
      }
      case "Mass Update": {
        const files = await input({ message: "Files glob" });
        content += `### Files\n${files}\n\n`;
        const prompt = await editor({ message: "Prompt" });
        content += `### Prompt\n${prompt}\n\n`;
        break;
      }
      case "Remove": {
        const file = await input({ message: "File path" });
        content += `### File\n${file}\n\n`;
        const condition = await editor({ message: "Condition" });
        content += `### Condition\n${condition}\n\n`;
        break;
      }
      case "Mass Remove": {
        const files = await input({ message: "Files glob" });
        content += `### Files\n${files}\n\n`;
        const prompt = await editor({ message: "Prompt" });
        content += `### Condition\n${prompt}\n\n`;
        break;
      }
      case "Evaluate": {
        const code = await editor({ message: "Write code" });
        content += `### Code\n${code}\n\n`;
        break;
      }
    }

    isAskingForTasks = await confirm({ message: "Add another task?" });
  }

  return content;
}
