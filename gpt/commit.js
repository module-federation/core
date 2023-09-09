const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const {
  MAX_TOKENS,
  MAX_CHAR_COUNT,
  model,
  chatHistory,
  MAIN_BRANCH,
  response,
} = require('./constants');
const { completionStream } = require('./services/openai');
const { readline } = require('./terminal');
const chalk = require('chalk');
const { get_encoding, encoding_for_model } = require('@dqbd/tiktoken');
const renderMarkdown = require('./markdown');
const { commandJoin } = require('command-join');
const schema = `
{
  "Title": "[fix|feat|chore|refactor]:[title]",
  "Description": "[description]",
  "Changes": [
    {{"filename": "[filename]", "description": ["[description]", "[description]"]}},
    {{"filename": "[filename]", "description": ["[description]", "[description]"]}}
  ]
}
\n
${response.end}`;

async function* getValidJsonResponse(prompt, userFeedback) {
  try {
    const stream = completionStream({ prompt });
    let answer = '';
    for await (const data of stream) {
      answer += data;
    }

    let enc = encoding_for_model(model);
    let encoded = enc.encode(prompt);
    enc.free();

    console.log(answer);
    const jsonResponse = JSON.parse(answer);

    // Check if response was likely truncated
    if ((answer?.usage?.total_tokens || encoded.length) >= MAX_TOKENS) {
      // Rephrase your request to get the rest of the information
      const followUpPrompt = 'Can you continue where you left off?';
      chatHistory.add({ role: 'user', content: followUpPrompt });
      const followUpStream = completionStream({ prompt: prompt });
      let followUpResponse = '';
      for await (const data of followUpStream) {
        followUpResponse += data;
      }

      // Append follow-up response to original response
      jsonResponse.Changes.push(...JSON.parse(followUpResponse).Changes);
    }

    yield jsonResponse;
  } catch (error) {
    console.error('Error parsing JSON response: ', error);
    chatHistory.add({
      role: 'user',
      content: 'There was an error, please try again.',
    });
    yield* getValidJsonResponse(prompt, userFeedback);
  }
}

function getDiff(maxCharCount = MAX_CHAR_COUNT) {
  let maxUFlag = 7;

  let diff = [
    execSync('git diff --staged --stat').toString(),
    execSync(`git diff -U${maxUFlag} --staged`).toString(),
  ].join('\n');

  while (diff.length > maxCharCount && maxUFlag > 2) {
    maxUFlag--;
    diff = [
      execSync('git diff --staged --stat').toString(),
      execSync(`git diff -U${maxUFlag} --staged`).toString(),
    ].join('\n');
    console.warn(
      'over max char count, reducing diff fidelity',
      'from:',
      diff.length,
      'to:',
      diff.length,
      `(-U flag now ${maxUFlag})`
    );
  }

  return diff;
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
async function generateCommitMsg() {
  console.log('Generating commit message for staged changes...');

  let diff = execSync('git diff -U10 --staged').toString();
  let files = execSync('git diff --name-only --cached').toString().trim();
  console.log('files', files);
  if (!files) {
    console.error('No files to commit');
    return;
  }

  console.log('tokens', diff.length, MAX_CHAR_COUNT);

  if (diff.length > MAX_CHAR_COUNT) {
    diff = getDiff(MAX_CHAR_COUNT);
  }

  let prompt = createPrompt(diff);

  let commitMsg;
  for await (const msg of getValidJsonResponse(prompt)) {
    commitMsg = msg;
  }

  return commitMsg;
}

function createPrompt(input, userFeedback) {
  return `I'm an AI assistant, and I'm here to assist you in creating a commit message. To ensure the process goes smoothly, please respond with a message in the JSON format specified below, and refrain from including any additional text. Your task is to suggest a detailed commit message for the given code changes.
In the description, provide an overall summary of the changes, and detail the changes for each file along with their respective change sets. The commit message should adhere to the following JSON format:

${schema}

Example:
{
  "Title": "fix: fix bug in commit message generation",
  "Description": "This commit fixes a bug in the commit message generation process.",
  "Changes": [
    {{"filename": "example.js", "description": ["created new example"]}},
    {{"filename": "src/example2.ts", "description": ["updated variable names", "added utility function to handle edge case"]}}
  ]
}
\n\n
Here's the git diff for your reference: ${input.slice(0, MAX_CHAR_COUNT)}`;
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
  if (!commitMsg.Changes) {
    console.log('commit message is empty', commitMsg);
  }
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
  // Split the body by newline characters to get an array of strings
  const bodyLines = body.split('\n');

  // Create an array for the git command
  let gitCmdArray = ['git', 'commit', '-m', title];

  // Iterate over the bodyLines array and add a "-m" followed by each line
  bodyLines.forEach((line) => {
    gitCmdArray.push('-m');
    gitCmdArray.push(line);
  });
  const gitCmd = commandJoin(gitCmdArray);
  console.log('Committing changes...');
  return execSync(gitCmd, { stdio: 'inherit' });
}

const runGenerativeCommit = async () => {
  let files = execSync('git diff --name-only --cached').toString().trim();
  console.log(files.length);
  if (!files.length > 0) {
    readline.write('No files to commit');
    readline.write('\n');
    readline.close();
    return;
  }
  const commitMsg = await generateCommitMsg();

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
        chatHistory.add({
          role: 'user',
          content: 'I did not like this suggestion, try again.',
        });
        readline.close();
        runGenerativeCommit();
      } else {
        console.log('Generating a new suggestion with user context...', answer);
        if (answer) chatHistory.add({ role: 'user', content: answer });
        runGenerativeCommit();
      }
    }
  );
};
async function recursiveAgent(input) {
  const model = new OpenAIChat({ temperature: 0.5, modelName: 'gpt-4', maxConcurrency: 40 });
  const tools = [
    new Calculator(),
    new GitAddTool({repoPath: process.cwd()}),
    new GitBranchListTool({repoPath: process.cwd()}),
    new GitCheckoutBranchTool({repoPath: process.cwd()}),
    new GitCommitTool({repoPath: process.cwd()}),
    new GitDeleteBranchTool({repoPath: process.cwd()}),
    new GitDiffStagedTool({repoPath: process.cwd()}),
    new GitStagedFilesTool({repoPath: process.cwd()}),
    // new GitTools.GitDiffTool({repoPath: process.cwd()}),
    //   new GitTools.GitNewBranchTool({repoPath: process.cwd()}),
    new GitPullTool({repoPath: process.cwd()}),
    //   new GitTools.GitPushTool({repoPath: process.cwd()}),
    //   new GitTools.GitStatusTool({repoPath: process.cwd()}),
  ];





  const llmChain = new LLMChain({
    prompt: new GitCommitPromptTemplate({
      tools,
      inputVariables: ["input", "agent_scratchpad"],
    }),
    llm: model,
  });

  const agent = new LLMSingleActionAgent({
    llmChain,
    outputParser: new GitCommitOutputParser(),
    stop: ["\nObservation"],
  });

  const executor = new AgentExecutor({
    agent,
    tools,
    agentType: "openai-functions",
  });


  console.log("Loaded agent.");

  const inputText = input

  console.log(`Executing with input`);

  const result = await executor.call({ input: inputText });


  console.log(`Commit message generated: ${result.commitMsg}`);
  return result.commitMsg
};

module.exports = {
  gitCommit,
  createMarkdownCommit,
  generateCommitMsg,
  runGenerativeCommit,
};
