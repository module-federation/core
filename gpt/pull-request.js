const { execSync } = require('child_process');
const { completionStream } = require('./services/openai');
const { readline } = require('./terminal');
const {
  MAX_CHAR_COUNT,
  MAIN_BRANCH,
  chatHistory,
  MAX_TOKENS,
} = require('./constants');
const renderMarkdown = require('./markdown');
const fs = require('fs');

function getCommitMessages(branchName) {
  const commitMessages = execSync(
    `git log ${MAIN_BRANCH}..${branchName} --pretty=format:"%B"`
  ).toString();
  return commitMessages;
}
function getCurrentBranch() {
  const currentBranch = execSync('git branch --show-current').toString().trim();
  return currentBranch;
}

function createLogJSONPrompt(input) {
  return `
Please suggest one detailed summary for the series of commit messages.
The summary should be composed of a title and a description.
In the description, provide an overall summary of the changes reflected in the commits, and list each commit with a brief explanation of its content.
Return it as a JSON object with the following format:
{{
"Title": "[summary title]",
"Description": "[summary description]",
"Commits": [
{{"commit": "[commit message]", "explanation": ["[explanation]", "[explanation]"]}},
{{"commit": "[commit message]", "explanation": ["[explanation]", "[explanation]"]}}
]
}}
Here are the commit messages: ${input.slice(0, MAX_CHAR_COUNT)}
__END_OF_RESPONSE__`;
}

/**
 * Creates a prompt string for summarizing a series of git commit messages, formatted as Markdown.
 *
 * @param {string} input - The series of git commit messages to summarize.
 * @param {string} [userFeedback] - Additional context provided by the user.
 *
 * @returns {string} The created prompt string for the AI to generate a detailed summary of the commits.
 *
 * @example
 *
 * const input = 'commit1: message1\ncommit2: message2';
 * const userFeedback = 'These commits are related to feature X';
 * const prompt = createLogMarkdownPrompt(input, userFeedback);
 * // expected output:
 * // "\nPlease suggest one detailed summary for the series of commit messages.\n\n
 * // The summary should be composed of a title and a description.\n\n
 * // In the description, provide an overall summary of the changes reflected in the commits, and list each commit with a brief explanation of its content.\n\n
 * // Return it as markdown format:\n
 * // # [summary title]\n
 * // [summary description]\n
 * // ## Commits\n
 * // - [commit message]\n
 * //  - [explanation]\n
 * //  - [explanation]\n
 * // - [commit message]\n
 * //  - [explanation]\n
 * //  - [explanation]\n
 * // \n\n
 * // The user has also provided the following context, which you may find useful: These commits are related to feature X\n
 * // Here are the commit messages: commit1: message1\ncommit2: message2"
 */
function createLogMarkdownPrompt(input) {
  return `
Please suggest one detailed summary for the series of commit messages.
The summary should be composed of a title and a description.
In the description, provide an overall summary of the changes reflected in the commits, and list each commit with a brief explanation of its content.
Return it as markdown format:
# [summary title]
[summary description]
## Commits
 - [commit message]
   - [explanation]
   - [explanation]
 - [commit message]
   - [explanation]
   - [explanation]

__END_OF_RESPONSE__

Here are the commit messages: ${input.slice(0, MAX_CHAR_COUNT)}`;
}
async function sendToGPTForSummary(commitMessages) {
  const responseChunks = [];
  const completionStreamGenerator = completionStream({
    prompt: commitMessages,
    temperature: 0.9,
    max_tokens: MAX_TOKENS ?? 800, // Adjust max_tokens based on your needs
  });
  console.log('Waiting for response from GPT...');

  for await (let chunk of completionStreamGenerator) {
    responseChunks.push(chunk);
    // Here, you can add additional logic to handle each chunk as it arrives
  }

  const markdownResponse = responseChunks.join('');
  return markdownResponse;
}

/**
 * Converts an AI generated summary of commit messages into markdown format.
 *
 * @param {object} summaryMsg - The JSON object returned from the AI summarizing commit messages.
 * @param {string} summaryMsg.Title - The title of the summary.
 * @param {string} summaryMsg.Description - The description of the summary.
 * @param {Array} summaryMsg.Commits - An array of objects, each representing a commit message and its explanation.
 * @param {string} summaryMsg.Commits[].commit - The commit message.
 * @param {Array} summaryMsg.Commits[].explanation - An array of explanations for the commit.
 *
 * @returns {string} The markdown formatted summary.
 *
 * @example
 *
 * const summaryMsg = {
 *   "Title": "Summary Title",
 *   "Description": "Summary Description",
 *   "Commits": [
 *     {"commit": "Commit Message 1", "explanation": ["Explanation 1", "Explanation 2"]},
 *     {"commit": "Commit Message 2", "explanation": ["Explanation 3", "Explanation 4"]}
 *   ]
 * };
 * const markdown = createMarkdownSummary(summaryMsg);
 * console.log(markdown);
 * // expected output:
 * // "# Summary Title\n\nSummary Description\n\n## Commit Message 1\n\n- Explanation 1\n- Explanation 2\n\n## Commit Message 2\n\n- Explanation 3\n- Explanation 4"
 */
function createMarkdownSummary(summaryMsg = {}) {
  const markdownSummaryMsg = `# ${summaryMsg.Title}\n\n${
    summaryMsg.Description
  }\n\n${summaryMsg.Commits.map(
    (commit) =>
      `## ${commit.commit}\n\n${commit.explanation
        .map((desc) => `- ${desc}`)
        .join('\n')}`
  ).join('\n\n')}`;

  return markdownSummaryMsg;
}

const generatePullRequestSummary = async (userFeedback) => {
  if (userFeedback) chatHistory.add({ role: 'user', content: userFeedback });
  const currentBranch = getCurrentBranch();
  console.log('Generating pull request summary for...', currentBranch);
  const commitMessages = getCommitMessages(currentBranch);
  console.log('Got commit messages, creating prompt...');
  const prompt = createLogMarkdownPrompt(commitMessages);
  console.log('Prompt created, sending to GPT...');
  const summary = await sendToGPTForSummary(prompt);

  console.log(renderMarkdown(summary));

  readline.question(
    'Accept this suggestion? (y/n) or type additional user feedback ',
    (answer) => {
      if (answer.toLowerCase() === 'y') {
        fs.writeFileSync('pr-summary.md', summary, 'utf8');
        readline.write('Wrote summary to pr-summary.md');
        readline.write('\n');
        readline.close();
      } else if (answer.toLowerCase() === 'n') {
        console.log('Generating a new suggestion...');
        generatePullRequestSummary('I did not like the suggestion, try again');
      } else {
        console.log('Generating a new suggestion with user context...', answer);
        generatePullRequestSummary(answer);
      }
    }
  );
};

module.exports = {
  getCommitMessages,
  getCurrentBranch,
  generatePullRequestSummary,
};
