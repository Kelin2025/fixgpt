const { Configuration, OpenAIApi } = require("openai");
const { parseMarkdown } = require("./parse-tree");

exports.queryGPT3 = async function queryGPT3(token, prompt) {
  const configuration = new Configuration({
    apiKey: token,
  });
  const openai = new OpenAIApi(configuration);

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4096 - prompt,
      n: 1,
      stop: null,
      temperature: 0.2,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error querying GPT-3.5:", error);
    process.exit(1);
  }
};

exports.extractCode = function extractCode(text) {
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
};
