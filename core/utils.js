import snakeCase from "lodash.snakecase";

function constructPrompt(obj) {
  let prompt = "";

  for (const k in obj) {
    if (obj[k].trim() !== "") {
      prompt += `${k}:\n${obj[k]}\n\n`;
    }
  }

  return prompt.trim();
}

async function injectVariables({ text, variables, responses }) {
  let nextText = text;
  // for (const variableName in variables) {
  //   nextText = nextText.replaceAll(
  //     `[[variables.${snakeCase(variableName)}]]`,
  //     variables[variableName].body.trim()
  //   );
  // }

  const askRegexp = /\[\[ask\.([A-z0-9-_]+)\.([A-z0-9-_]+)\]\]/g;
  const questions = [...nextText.matchAll(askRegexp)];
  const alreadyAsked = [];
  for (const match of questions) {
    const [string, type, name] = match;
    if (!alreadyAsked.includes(name)) {
      nextText = nextText.replaceAll(string, await input({ message: name }));
    }
  }

  for (const responseIdx in responses) {
    const curResponse = responses[responseIdx];
    for (const k in curResponse) {
      nextText = nextText.replaceAll(
        `[[responses.${responseIdx}.${k}]]`,
        curResponse[k]
      );
    }
  }
  return nextText;
}

export { constructPrompt, injectVariables };
