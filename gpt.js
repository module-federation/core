#!/usr/bin/env node

const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const readline = require('readline');
const { get_encoding, encoding_for_model } = require('@dqbd/tiktoken');
const { marked } = require('marked');
const TerminalRenderer = require('marked-terminal');
const chalk = require('chalk');
dotenv.config();
const MAX_CHAR_COUNT = 10000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Configure marked to use `marked-terminal` as the renderer
marked.setOptions({
  // Define custom renderer
  mangle: false,
  headerIds: false,
  renderer: new TerminalRenderer({
    firstHeading: chalk.magenta.underline.bold,
    heading: chalk.green.underline,
  }),
});

let createPrompt = (diff) => `
Please suggest one detailed commit message for the code changes.\n
Each commit message should be composed of a title and a description.\n
In the description list overall summary of changes, and list changes for each file and the change sets for them.\n
Return it as a JSON object with the following format:\n
{{
"Title": "[title]",
"Description": "[description]",
"Changes": [
{{"filename": "[filename]", "description": ["[description]", "[description]"]}},
{{"filename": "[filename]", "description": ["[description]", "[description]"]}}
]
}}
Here are the changes: ${diff.slice(0, MAX_CHAR_COUNT)}
    `;

async function generateCommitMsg() {
  console.log('Generating commit message for...');
  const argv = yargs(hideBin(process.argv)).argv;
  let diff = execSync('git diff -U10 --staged').toString();
  let files = execSync('git diff --name-only --cached').toString().trim();
  console.log(files);
  if (!files.length > 0) {
    console.error('No files to commit');
    return;
  }
  let prompt = createPrompt(diff);
  const enc = encoding_for_model('gpt-3.5-turbo');
  const encoded = enc.encode(prompt);
  enc.free();

  if (diff.length > MAX_CHAR_COUNT) {
    console.warn('over max char count, truncating diff', diff.length);
    const diffStat = execSync('git diff --staged --stat').toString();
    const diffContext = execSync('git diff -U3 --staged').toString();
    diff = diffStat + '\n' + diffContext;
  }

  const chatgptApiEndpoint = 'https://api.openai.com/v1/chat/completions';
  const chatgptApiKey = process.env.OPENAI_API_KEY;
  if (!chatgptApiKey) {
    throw new Error('Please set the  OPENAI_API_KEY environment variable.');
  }

  const userCommitMsg = argv.message ? argv.message : '';

  if (userCommitMsg) {
    prompt += `\nThe user has already specified this commit message: ${userCommitMsg}\n`;
  }
  console.log('Sending prompt to OpenAI API...');
  const response = await fetch(chatgptApiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${chatgptApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'assistant', content: prompt }],
      temperature: 0.7,
    }),
  });
  console.log('got response');
  const data = await response.json();
  let commitMsg = '';

  try {
    commitMsg = data.choices[0].message.content;
  } catch (error) {
    console.error(
      `Unexpected response from the API: ${JSON.stringify(data, null, 2)}`
    );
  }

  const commitMessages = commitMsg
    .split('\n')
    .filter((line) => line.includes('Commit message:'))
    .map((line) => line.split(':')[1].trim());

  console.log('usage', data.usage, 'predicted tokens:', encoded.length);
  // console.log(require('util').inspect(data, { depth: null }));

  try {
    commitMsg = JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error(
      `Unexpected response from the API: ${JSON.stringify(data, null, 2)}`
    );
  }

  return commitMsg;
}
function createMarkdownCommit(commitMsg = {}) {
  const markdownCommitMsg = `# ${commitMsg.Title}\n\n${
    commitMsg.Description
  }\n\n${commitMsg.Changes.map(
    (change) =>
      `### ${change.filename}\n\n${change.description
        .map((desc) => `- ${desc}`)
        .join('\n')}`
  ).join('\n\n')}`;

  return markdownCommitMsg;
}

function gitCommit(title, body) {
  execSync(`git commit -m "${title}" -m "${body}"`, { stdio: 'inherit' });
}

const run = async () => {
  let files = execSync('git diff --name-only --cached').toString().trim();
  console.log(files.length);
  if (!files.length > 0) {
    rl.write('No files to commit');
    rl.write('\n');
    rl.close();
    return;
  }
  const commitMsg = await generateCommitMsg();

  const markdown = createMarkdownCommit(commitMsg);

  const title = commitMsg.Title;
  const body = markdown.replace(`# ${title}\n\n`, '');

  console.log(marked(markdown));

  rl.question('Accept this suggestion? (y/n) ', (answer) => {
    if (answer.toLowerCase() === 'y') {
      gitCommit(title, body);
      rl.close();
    } else {
      console.log('Generating a new suggestion...');
      run();
    }
  });
};

run();
