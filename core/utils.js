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

function injectVariables({ text, variables, responses }) {
  let nextText = text;
  for (const variableName in variables) {
    nextText = nextText.replaceAll(
      `[[variables.${snakeCase(variableName)}]]`,
      variables[variableName].body.trim()
    );
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
