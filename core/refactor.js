import fs from "fs";
import fse from "fs-extra";
import path from "path";
import nanoclone from "nanoclone";
import safeEval from "safe-eval";
import { globSync } from "glob";

import { queryGPT3, extractCode } from "./prompt.js";
import { parseTree } from "./parse-tree.js";
import { injectVariables, constructPrompt } from "./utils.js";

const system_prompt = `You're a program that edits code files. Your answers will not be read by a human, it is for internal API. Your responses will have no chatbot introduction, no chatbot summary, no labels, no instructions, no chatbot language at all.

There're three type of commands
- Insert. I give you description, you answer only with an updated source
- Update. I give you instruction, you answer only with an updated source
- Remove. I give you condition and source, you answer only with "yes" if it should be removed, or "no" otherwise

If something violates your rules or following the command is impossible, answer with "NULL".
`;

async function refactor(token, template_name) {
  const templatePath = path.join(template_name);

  if (!fs.existsSync(templatePath)) {
    console.error(`Template '${template_name}' not found.`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const templateData = parseTree(template);
  const tasks = templateData["Tasks"] ?? {};
  const variables = templateData["Variables"]?.children ?? {};

  const responses = [];
  const currentTemplateData = nanoclone(templateData);
  const currentTasks = currentTemplateData["Tasks"].children;

  for (const taskName in tasks.children) {
    const currentTask = currentTasks[taskName].children;
    const action = currentTask["Action"].body.trim();
    let response;
    switch (action) {
      case "Read":
        response = await read({
          file: injectVariables({
            text: currentTask["File"].body.trim(),
            variables,
            responses,
          }),
        });
        break;
      case "Create":
        response = await create({
          token,
          file: injectVariables({
            text: currentTask["File"].body.trim(),
            variables,
            responses,
          }),
          instruction: injectVariables({
            text: currentTask["Prompt"].body.trim(),
            variables,
            responses,
          }),
        });
        break;
      case "Update":
        response = await update({
          token,
          file: injectVariables({
            text: currentTask["File"].body.trim(),
            variables,
            responses,
          }),
          instruction: injectVariables({
            text: currentTask["Prompt"].body.trim(),
            variables,
            responses,
          }),
        });
        break;
      case "Mass Update":
        response = await massUpdate({
          token,
          files: injectVariables({
            text: currentTask["Files"].body.trim(),
            variables,
            responses,
          }),
          instruction: injectVariables({
            text: currentTask["Prompt"].body.trim(),
            variables,
            responses,
          }),
        });
        break;
      case "Remove":
        response = await removeIf({
          token,
          file: injectVariables({
            text: currentTask["File"].body.trim(),
            variables,
            responses,
          }),
          condition: injectVariables({
            text: currentTask["Prompt"].body.trim(),
            variables,
            responses,
          }),
        });
        break;
      case "Mass Remove":
        response = await massRemoveIf({
          token,
          files: injectVariables({
            text: currentTask["Files"].body.trim(),
            variables,
            responses,
          }),
          condition: injectVariables({
            text: currentTask["Prompt"].body.trim(),
            variables,
            responses,
          }),
        });
        break;
      case "Evaluate":
        response = await evaluate({
          token,
          file,
          code: extractCode(
            injectVariables({
              text: currentTask["Code"].body.trim(),
              variables,
              responses,
            })
          ),
          responses,
        });
        break;
    }
    responses.push(response);
  }

  console.log("Refactoring complete.");
}

async function create({ token, instruction, file }) {
  console.log(`Create ${file}`);
  const response = await queryGPT3(token, [
    { role: "system", content: system_prompt },
    {
      role: "user",
      content: constructPrompt({
        Action: "Create",
        Instruction: instruction,
      }),
    },
  ]);
  const code = extractCode(response);
  fse.ensureFileSync(file);
  if (code.length === 0) {
    console.error(`No code to create found: ${response}`);
  } else {
    console.log(code);
    fs.writeFileSync(file, code);
  }
  return { code, file };
}

async function read({ token, file }) {
  console.log(`Read ${file}`);
  const code = fs.readFileSync(file, "utf-8");
  console.log(code);
  console.log("\n");
  return { code, file };
}

async function update({ token, instruction, file }) {
  console.log(`Update ${file}`);
  const source = fs.readFileSync(file, "utf8");
  const response = await queryGPT3(token, [
    { role: "system", content: system_prompt },
    {
      role: "user",
      content: constructPrompt({
        Action: "Update",
        Instruction: instruction,
        Source: source,
      }),
    },
  ]);
  const code = extractCode(response);
  console.log(code);
  console.log("\n");
  fs.writeFileSync(file, code);
  return { file, source, code };
}

async function massUpdate({ token, instruction, files }) {
  const paths = globSync(files);
  const updated = [];
  for (const file of paths) {
    updated.push(await update({ token, instruction, file }));
  }
  return { files: paths, updated };
}

async function removeIf({ token, condition, file }) {
  console.log(`Remove ${file}`);
  const source = fs.readFileSync(file, "utf8");
  const response = await queryGPT3(token, [
    { role: "system", content: system_prompt },
    {
      role: "user",
      content: constructPrompt({
        Action: "Remove",
        Condition: condition,
        Source: source,
      }),
    },
  ]);
  const trimmedResponse = response.trim().toLocaleLowerCase();

  if (!["yes", "yes.", "no", "no."].includes(trimmedResponse)) {
    console.error(`Wrong response: ${response}`);
  }

  const isYes = ["yes", "yes."].includes(trimmedResponse);

  console.log("Decision: ", trimmedResponse);
  console.log("\n");

  if (isYes) {
    fs.unlinkSync(file);
  }

  return {
    file,
    source,
    response: trimmedResponse,
    isRemoved: isYes,
  };
}

async function massRemoveIf({ token, condition, files }) {
  const paths = globSync(files.replaceAll("`", ""));
  const removed = [];
  for (const file of paths) {
    removed.push(await removeIf({ token, condition, file }));
  }
  return { files: paths, removed };
}

async function evaluate({ token, code, file, responses }) {
  const source = fs.readFileSync(file, "utf8");

  const response = safeEval(code, {
    source,
    file,
    responses,
  });

  return { file, source, response };
}

export {
  refactor,
  read,
  create,
  update,
  massUpdate,
  removeIf,
  massRemoveIf,
  evaluate,
};
