#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('base-branch', {
    alias: 'b',
    type: 'string',
    description: 'Base branch to compare against (default: main/master)',
  })
  .help()
  .alias('help', 'h').argv;

function sanitizeInput(input) {
  return input.replace(/[^a-zA-Z0-9_\-\/\.]/g, '');
}

function getAllowedScopes() {
  const packagesDir = path.resolve(__dirname, 'packages');
  const scopes = [];

  if (!fs.existsSync(packagesDir)) {
    return scopes;
  }

  fs.readdirSync(packagesDir).forEach((dir) => {
    const projectJsonPath = path.join(packagesDir, dir, 'project.json');
    if (fs.existsSync(projectJsonPath)) {
      const projectJson = JSON.parse(fs.readFileSync(projectJsonPath, 'utf8'));
      if (projectJson.name) {
        scopes.push(projectJson.name);
      }
    }
  });

  return scopes;
}

async function generateCommitMessage(patch) {
  const allowedScopes = getAllowedScopes().join(', ');
  const prompt = `Generate a conventional commit message for the following git patch.
RULES:
Never author BREAKING CHANGE messages, they are not allowed.
Message must be less than 100 characters total.
Be concise and direct.
Provide no explanation

Focus on a statement of work of the changes:

${patch}

${allowedScopes.length > 0 ? `Allowed scopes: ${allowedScopes}` : ''}

Please format the commit message as follows:
<type>(<scope>): <subject>`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Generate concise commit messages under 100 characters. Never author BREAKING CHANGE commits.',
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 100,
  });

  return response.choices[0].message.content
    .trim()
    .replace('```markdown', '')
    .replace('```', '')
    .replace(/^```(?:\w+)?|```$/g, '')
    .trim()
    .replace(/^\`/, '')
    .replace(/\`$/, '')
    .trim();
}

// Get list of commits in the current branch excluding merge commits
function getBranchCommits(baseBranch) {
  try {
    // If base branch is not specified, try to get the default branch from git
    if (!baseBranch) {
      try {
        baseBranch = execSync(
          'git symbolic-ref refs/remotes/origin/HEAD | sed "s@^refs/remotes/origin/@@g"',
          { shell: '/bin/bash' },
        )
          .toString()
          .trim();
      } catch (e) {
        // If that fails, default to main
        baseBranch = 'main';
      }
    }

    console.log(`Using base branch: ${baseBranch}`);

    // Get commits in current branch not in base branch, excluding merge commits
    const output = execSync(
      `git log origin/${baseBranch}..HEAD --no-merges --format="%H"`,
      { shell: '/bin/bash' },
    )
      .toString()
      .trim();

    return output ? output.split('\n') : [];
  } catch (error) {
    console.error('Error getting branch commits:', error.message);
    process.exit(1);
  }
}

// Get the diff for a specific commit
function getCommitDiff(commitHash) {
  try {
    // Get the diff excluding pnpm-lock.yaml
    return execSync(
      `git show --patch ${commitHash} ":(exclude)pnpm-lock.yaml"`,
      {
        shell: '/bin/bash',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      },
    ).toString();
  } catch (error) {
    console.error(
      `Error getting diff for commit ${commitHash}:`,
      error.message,
    );
    return null;
  }
}

// Rewrite the commit message
async function rewriteCommitMessage(commitHash, newMessage) {
  try {
    // Create a temporary file with the new commit message
    const tempFile = path.join(process.cwd(), '.temp-commit-msg');
    fs.writeFileSync(tempFile, newMessage);

    // Use git filter-branch to rewrite the commit message
    execSync(
      `git filter-branch --force --msg-filter 'if [ "$GIT_COMMIT" = "${commitHash}" ]; then cat ${tempFile}; else cat; fi' -- ${commitHash}^..${commitHash}`,
      { shell: '/bin/bash' },
    );

    // Remove the temporary file
    fs.unlinkSync(tempFile);
    return true;
  } catch (error) {
    console.error(
      `Error rewriting message for commit ${commitHash}:`,
      error.message,
    );
    return false;
  }
}

// Process all commits in the branch
async function processBranchCommits() {
  const commits = getBranchCommits(argv['base-branch']);

  if (commits.length === 0) {
    console.log('No commits found in this branch.');
    return;
  }

  console.log(`Found ${commits.length} commits to process.`);

  // Process commits from oldest to newest
  for (const commitHash of commits.reverse()) {
    const diff = getCommitDiff(commitHash);
    if (!diff) continue;

    try {
      // Get the original commit message for reference
      const originalMessage = execSync(`git log -1 --format=%B ${commitHash}`, {
        shell: '/bin/bash',
      })
        .toString()
        .trim();

      console.log(`\nProcessing commit ${commitHash.substring(0, 8)}...`);
      console.log(`Original message: ${originalMessage}`);

      const newMessage = await generateCommitMessage(diff);
      console.log(`New message: ${newMessage}`);

      const success = await rewriteCommitMessage(commitHash, newMessage);
      if (success) {
        console.log(`Updated commit message for ${commitHash.substring(0, 8)}`);
      } else {
        console.log(
          `Failed to update commit message for ${commitHash.substring(0, 8)}`,
        );
      }
    } catch (error) {
      console.error(`Error processing commit ${commitHash}:`, error.message);
    }
  }

  console.log('\nFinished processing branch commits.');
  console.log(
    'IMPORTANT: You will need to force push these changes with: git push --force',
  );
}

// Main function
async function main() {
  try {
    await processBranchCommits();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
