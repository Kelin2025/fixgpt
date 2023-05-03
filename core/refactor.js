const fs = require("fs");
const path = require("path");
const glob = require("glob");
const nanoclone = require("nanoclone");

const { queryGPT3, extractCode } = require("./prompt");
const { parseTree } = require("./parse-tree");

exports.refactor = async function refactor(token, template_name, files_glob) {
  const templatePath = path.join(template_name);

  if (!fs.existsSync(templatePath)) {
    console.error(`Template '${template_name}' not found.`);
    process.exit(1);
  }

  const template = fs.readFileSync(templatePath, "utf8");
  const templateData = parseTree(template);
  const tasks = templateData["Tasks"] ?? {};
  const variables = templateData["Variables"]?.children ?? {};

  const files = glob.sync(files_glob);

  for (const file of files) {
    let content = fs.readFileSync(file, "utf8");

    const currentTemplateData = nanoclone(templateData);

    const currentTasks = currentTemplateData["Tasks"].children;

    for (const taskName in tasks.children) {
      const prompt = currentTasks[taskName].children["Prompt"];
      for (const variableName in variables) {
        prompt.body = prompt.body.replaceAll(
          variableName,
          variables[variableName].body.trim()
        );
      }
      prompt.body = prompt.body.replaceAll("[input]", content);
      content = extractCode(await queryGPT3(token, prompt.body));
    }

    fs.writeFileSync(file, content);
  }

  console.log("Refactoring complete.");
};
