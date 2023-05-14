#!/usr/bin/env node

const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const readline = require('readline');

dotenv.config();
const MAX_CHAR_COUNT = 10000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function generateCommitMsg() {
  const argv = yargs(hideBin(process.argv)).argv;
  let diff = execSync('git diff -U10 --staged').toString();

  console.log(diff);

  if (diff.length > MAX_CHAR_COUNT) {
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

  let prompt = `
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

  if (userCommitMsg) {
    prompt += `\nThe user has already specified this commit message: ${userCommitMsg}\n`;
  }

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
      max_tokens: 4097,
    }),
  });
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
  const markdownCommitMsg = `## ${commitMsg.Title}\n\n${
    commitMsg.Description
  }\n\n${commitMsg.Changes.map(
    (change) =>
      `### ${change.filename}\n\n${change.description
        .map((desc) => `- ${desc}`)
        .join('\n')}`
  ).join('\n\n')}`;

  return markdownCommitMsg;
}

const run = async () => {
  const commitMsg = await generateCommitMsg();

  console.log(require('util').inspect(commitMsg, { depth: null }));
  const markdown = createMarkdownCommit(commitMsg);

  console.log(markdown);

  rl.question('Accept this suggestion? (yes/no) ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      console.log('DONE');
      rl.close();
    } else {
      console.log('Generating a new suggestion...');
      run();
    }
  });
};

run();
