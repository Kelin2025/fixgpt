const MarkdownIt = require("markdown-it");

const md = new MarkdownIt();

exports.parseMarkdown = function parseMarkdown(markdownText) {
  const tokens = md.parse(markdownText, {});

  return tokens;
};

exports.parseTree = function parseTree(markdownText) {
  const tokens = md.parse(markdownText, {});
  const output = {};
  let headingStack = [];

  tokens.forEach((token, i) => {
    if (token.type === "heading_open") {
      const level = parseInt(token.tag.slice(1), 10);
      const title = tokens[i + 1].content;

      const heading = {
        title,
        level,
        children: {},
        body: "",
      };

      if (level === 1) {
        output[title] = heading;
        headingStack = [heading];
      } else {
        while (headingStack.length < level - 1) {
          const placeholder = {
            title: "",
            level: headingStack.length + 1,
            children: {},
            body: "",
          };
          headingStack.push(placeholder);
        }
        const parentHeading = headingStack[level - 2];
        parentHeading.children[title] = heading;
        headingStack = headingStack.slice(0, level - 1);
        headingStack.push(heading);
      }
    } else if (token.type === "paragraph_open" || token.type === "fence") {
      const content =
        token.type === "paragraph_open"
          ? tokens[i + 1].content
          : `\`\`\`\n${token.content}\n\`\`\``;
      const currentHeading = headingStack[headingStack.length - 1];

      if (currentHeading) {
        currentHeading.body += `${content}\n\n`;
      }
    }
  });

  return output;
};
