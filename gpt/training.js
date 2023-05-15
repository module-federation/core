const ts = require('typescript');
const commentParser = require('comment-parser');
const fs = require('fs');
const path = require('path');
const { completion } = require('./services/openai');
const { chatHistory } = require('./constants');
function generatePromptTargetPairs(directory) {
  let pairs = [];

  fs.readdirSync(directory).forEach((file) => {
    const absolutePath = path.join(directory, file);
    const stat = fs.lstatSync(absolutePath);

    if (
      stat.isDirectory() &&
      !['node_modules', 'dist', '.next'].includes(file)
    ) {
      pairs = pairs.concat(generatePromptTargetPairs(absolutePath));
    } else if (
      stat.isFile() &&
      (path.extname(file) === '.js' || path.extname(file) === '.ts')
    ) {
      const content = fs.readFileSync(absolutePath, 'utf-8');
      const sourceFile = ts.createSourceFile(
        file,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      ts.forEachChild(sourceFile, (node) => {
        if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
          const jsdocComments = ts.getJSDocCommentsAndTags(node);
          if (jsdocComments.length > 0) {
            const parsedComments = commentParser.parse(
              jsdocComments[0].getText()
            );
            if (parsedComments.length > 0) {
              const prompt = parsedComments[0].description;
              const target = node.getText();
              pairs.push({ prompt, target });
            }
          }
        }
      });
    }
  });

  return pairs;
}

const pre_prompt = `
Improve this training prompt/target pair. You should rewrite prompts to better match the target code.
If there is no prompt, then generate a prompt for the target provided.

return only the updated prompt, no additional text, in this format:\n
__PROMPT_START__
[updated prompt]
__PROMPT_END__
__PROMPT_START__
[updated prompt]
__PROMPT_END__
__PROMPT_START__
[updated prompt]
__PROMPT_END__
__PROMPT_START__
[updated prompt]
__PROMPT_END__
\n
`;

async function writeToJsonl(pairs, outputFilePath) {
  const writeStream = fs.createWriteStream(outputFilePath, {
    encoding: 'utf-8',
  });
  const missingPrompt = [];

  let prompt = [];
  for (let i = 0; i < pairs.length; i += 2) {
    const chunk = pairs.slice(i, i + 5);
    const promptGroup = chunk
      .filter((pair) => {
        if (!pair.prompt.trim()) {
          missingPrompt.push(pair);
          return false;
        }
        return true;
      })
      .map((pair) => `Prompt: ${pair.prompt}\nTarget: ${pair.target}\n`);
    if (promptGroup.length === 0) continue;
    prompt.push(promptGroup);
  }

  for (const pg of prompt) {
    chatHistory.add({ role: 'user', content: pg.join('\n') });
    const resp = await completion({
      prompt: pre_prompt,
      temperature: 0.5,
      max_tokens: 300,
      model: 'gpt-4',
    });
    chatHistory.add({ role: 'assistant', content: resp });
    const updatedPrompts = resp
      .split('__PROMPT_END__')
      .map((prompt) => prompt.replace('__PROMPT_START__', '').trim())
      .filter(Boolean);
    pg.forEach((pair, index) => {
      const targetCode = pair.split('Target:')[1];
      writeStream.write(
        JSON.stringify({ prompt: updatedPrompts[index], target: targetCode }) +
          '\n'
      );
    });
  }

  writeStream.end();
}

const pairs = generatePromptTargetPairs(process.cwd());
writeToJsonl(pairs, 'prompt_target_pairs.jsonl');
