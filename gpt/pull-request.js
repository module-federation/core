const { execSync } = require('child_process');
const {
  MAX_CHAR_COUNT,
  sendPromptToGPT,
  readline,
  chatHistory,
} = require('./ai');
const renderMarkdown = require('./markdown');
const fs = require('fs');

const mainbranch = 'quantum_modules';

function getCommitMessages(branchName) {
  const commitMessages = execSync(
    `git log ${mainbranch}..${branchName} --pretty=format:"%B"`
  ).toString();
  return commitMessages;
}
function getCurrentBranch() {
  const currentBranch = execSync('git branch --show-current').toString().trim();
  return currentBranch;
}

function createLogJSONPrompt(input) {
  return `
Please suggest one detailed summary for the series of commit messages.\n
The summary should be composed of a title and a description.\n
In the description, provide an overall summary of the changes reflected in the commits, and list each commit with a brief explanation of its content.\n
Return it as a JSON object with the following format:\n
{{
"Title": "[summary title]",
"Description": "[summary description]",
"Commits": [
{{"commit": "[commit message]", "explanation": ["[explanation]", "[explanation]"]}},
{{"commit": "[commit message]", "explanation": ["[explanation]", "[explanation]"]}}
]
}}
Here are the commit messages: ${input.slice(0, MAX_CHAR_COUNT)}`;
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
function createLogMarkdownPrompt(input, userFeedback) {
  return `
Please suggest one detailed summary for the series of commit messages.\n
The summary should be composed of a title and a description.\n
In the description, provide an overall summary of the changes reflected in the commits, and list each commit with a brief explanation of its content.\n
Reply in multiple seperate messages:\n
Return it as markdown format:\n
# [summary title]
[summary description]
## Commits
 - [commit message]
   - [explanation]
   - [explanation]
 - [commit message]
   - [explanation]
   - [explanation]
\n
__gpt__ \n
${
  userFeedback
    ? `The user has also provided the following context, which you may find useful: ${userFeedback}`
    : ''
}\n
Here are the commit messages: ${input.slice(0, MAX_CHAR_COUNT)}`;
}
async function sendToGPTForSummary(commitMessages, userFeedback) {
  const markdownResponse = await sendPromptToGPT({
    prompt: commitMessages,
    userFeedback: userFeedback,
  });

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
  const currentBranch = getCurrentBranch();
  console.log('Generating pull request summary for...', currentBranch);
  const commitMessages = getCommitMessages(currentBranch);
  console.log('Got commit messages, creating prompt...');
  const prompt = createLogMarkdownPrompt(
    commitMessages
    // userFeedback
  );
  const summary = await sendToGPTForSummary(prompt, userFeedback);

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

  // console.log('generated summary', summary);
  // return summary;
};

module.exports = {
  getCommitMessages,
  getCurrentBranch,
  generatePullRequestSummary,
};
