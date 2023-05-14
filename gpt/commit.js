const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { MAX_CHAR_COUNT, sendPromptToGPT, readline } = require('./ai');
const chalk = require('chalk');
const { get_encoding, encoding_for_model } = require('@dqbd/tiktoken');
const renderMarkdown = require('./markdown');
const { commandJoin } = require('command-join');
const schema = `
{
  "Title": "[title]",
  "Description": "[description]",
  "Changes": [
    {{"filename": "[filename]", "description": ["[description]", "[description]"]}},
    {{"filename": "[filename]", "description": ["[description]", "[description]"]}}
  ]
}
`;
/**
 * Creates a string prompt for the GPT-3 model.
 *
 * @param {string} input - The input string that will be included in the prompt.
 *
 * @returns {string} The created prompt.
 */
function createPrompt(input, userFeedback) {
  return `
I'm an AI and I'm here to help you create a commit message. Please respond only with a message in the following JSON format, and do not include any additional text.\n
Please suggest one detailed commit message for the code changes.\n
Each commit message should be composed of a title and a description.\n
In the description list overall summary of changes, and list changes for each file and the change sets for them.\n
ALWAYS Return it as a JSON object with the following format:\n

${schema}
\n\n
${
  userFeedback
    ? `The user has also provided the following context, which you may find useful: ${userFeedback}`
    : ''
}\n
Here are the changes: ${input.slice(0, MAX_CHAR_COUNT)}`;
}

/**
 * Tries to get a valid JSON response from the AI.
 *
 * This function will send the prompt to the AI and try to parse the response.
 * If the response is not valid JSON, it will send a new prompt asking the AI to respond correctly.
 *
 * @param {string} prompt - The initial prompt to send to the AI.
 * @param {string} userFeedback - The feedback to send to the AI if the response is not valid JSON.
 * @returns {Object} The parsed commit message from the AI's response.
 *
 * @throws {Error} If the API response cannot be parsed into JSON.
 *
 * @async
 */
async function getValidJsonResponse(prompt, userFeedback) {
  try {
    const aiReply = await sendPromptToGPT({
      prompt: userFeedback ? '' : prompt,
      userFeedback: userFeedback
        ? [
            userFeedback,
            'Please provide a response strictly in the following JSON format, without any additional text:',
            schema,
          ].join('\n')
        : '',
    });
    return JSON.parse(aiReply);
  } catch (error) {
    console.error(
      `The response from the AI was not in the expected format: ${error.message}`
    );
    console.error('Retrying with format consistency prompt...');
    const aiReply = await sendPromptToGPT({
      undefined,
      userFeedback: [
        'Please provide a response strictly in the following JSON format, without any additional text:',
        schema,
        'Try again with the following prompt:',
        userFeedback,
      ].join('\n'),
    });
    debugger;
    return JSON.parse(aiReply);
  }
}

/**
 * Generates a commit message using the GPT-3 model.
 *
 * This function will generate a diff of the current changes, create a prompt,
 * and send the prompt to the GPT-3 model. If a message is passed in via command line arguments,
 * it will be included in the prompt. If the length of the diff exceeds the maximum character count,
 * the diff will be truncated.
 *
 * @returns {Object} The parsed commit message from the AI's response, or an empty string if there is an error.
 *
 * @throws {Error} If the API response cannot be parsed into JSON.
 *
 * @async
 */
async function generateCommitMsg(userFeedback) {
  console.log('Generating commit message for staged changes...');

  let diff = execSync('git diff -U10 --staged').toString();
  let files = execSync('git diff --name-only --cached').toString().trim();

  if (!files) {
    console.error('No files to commit');
    return;
  }

  if (diff.length > MAX_CHAR_COUNT) {
    console.warn('over max char count, truncating diff', diff.length);
    diff = [
      execSync('git diff --staged --stat').toString(),
      execSync('git diff -U5 --staged').toString(),
    ].join('\n');
  }

  // let userCommitMsg = yargs(hideBin(process.argv)).argv.message;

  let prompt = createPrompt(diff);
  // if (userCommitMsg) {
  //   prompt += `\nThe user has already specified this commit message: ${userCommitMsg}\n`;
  // }

  try {
    return await getValidJsonResponse(prompt, userFeedback);
  } catch (error) {
    console.error(
      `Unexpected response from the API: ${JSON.stringify(error, null, 2)}`
    );
  }
}

/**
 * Creates a markdown-formatted commit message.
 *
 * This function takes a commit message object and formats it into a markdown string.
 * The object is expected to have "Title", "Description", and "Changes" properties.
 * The "Changes" property should be an array of objects, each with a "filename" and
 * a "description" property. The "description" should be an array of strings.
 *
 * @param {Object} commitMsg - The commit message object to format.
 * @param {string} commitMsg.Title - The title of the commit message.
 * @param {string} commitMsg.Description - The description of the commit message.
 * @param {Array<Object>} commitMsg.Changes - An array of change objects.
 * @param {string} commitMsg.Changes[].filename - The filename for a change.
 * @param {Array<string>} commitMsg.Changes[].description - An array of descriptions for a change.
 *
 * @returns {string} The markdown-formatted commit message.
 */
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

/**
 * Executes a git commit command with provided title and body as messages.
 *
 * @param {string} title - The title of the git commit.
 * @param {string} body - The body of the git commit. This can be a multiline string.
 * @returns {Buffer} - The output of the execSync command, usually an empty Buffer unless an error occurred.
 */
function gitCommit(title, body) {
  const gitCmd = commandJoin(['git', 'commit', '-m', title, '-m', body]);
  console.log('Committing changes...');
  return execSync(gitCmd, { stdio: 'inherit' });
}

const runGenerativeCommit = async (userFeedback) => {
  let files = execSync('git diff --name-only --cached').toString().trim();
  console.log(files.length);
  if (!files.length > 0) {
    readline.write('No files to commit');
    readline.write('\n');
    readline.close();
    return;
  }
  const commitMsg = await generateCommitMsg(userFeedback);

  const markdown = createMarkdownCommit(commitMsg);

  const title = commitMsg.Title;
  const body = markdown.replace(`# ${title}\n\n`, '');

  console.log(renderMarkdown(markdown));

  readline.question(
    'Accept this suggestion? (y/n) or provide user context:',
    (answer) => {
      if (answer.toLowerCase() === 'y') {
        gitCommit(title, body);
        readline.close();
      } else if (answer.toLowerCase() === 'n') {
        console.log('Generating a new suggestion...');
        runGenerativeCommit('I did not like this suggestion, try again.');
      } else {
        console.log('Generating a new suggestion with user context...', answer);
        runGenerativeCommit(answer);
      }
    }
  );
};

module.exports = {
  gitCommit,
  createMarkdownCommit,
  generateCommitMsg,
  runGenerativeCommit,
};
