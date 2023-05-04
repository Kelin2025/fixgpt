import { Configuration, OpenAIApi } from "openai";
import { parseMarkdown } from "./parse-tree.js";

export async function queryGPT3(token, messages) {
  const configuration = new Configuration({
    apiKey: token,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages,
      n: 1,
      stop: null,
      temperature: 0.0,
    });
    const content = response.data.choices[0].message.content;
    if (content.startsWith("NULL")) {
      throw new Error(content);
    }
    return content;
  } catch (error) {
    console.error("Error querying GPT-3.5:", error?.response?.data ?? error);
    process.exit(1);
  }
}

export function extractCode(text) {
  const tokens = parseMarkdown(text);
  let content = "";

  if (tokens.some((token) => token.type === "fence")) {
    content = tokens
      .filter((token) => token.type === "fence")
      .map((token) => token.content)
      .join("\n\n");
  } else {
    tokens.forEach((token, i) => {
      if (token.type === "paragraph_open") {
        content += `${tokens[i + 1].content}\n\n`;
      }

      if (token.type === "fence") {
        content += `${token.content}\n\n`;
      }
    });
  }

  return `${content.trim()}\n`;
}
