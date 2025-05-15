#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const os = require('os');

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
  .option('apply', {
    alias: 'a',
    type: 'boolean',
    description: 'Create a shell script to apply changes',
    default: false,
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
    .replace(/```/g, '')
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

// Process all commits in the branch
async function processBranchCommits() {
  const commits = getBranchCommits(argv['base-branch']);

  if (commits.length === 0) {
    console.log('No commits found in this branch.');
    return;
  }

  console.log(`Found ${commits.length} commits to process.`);

  // Prepare a map of commit hashes to new messages
  const commitMessages = {};

  // Process commits from oldest to newest (reverse to get chronological order)
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

      // Store the new message with the commit hash
      commitMessages[commitHash] = newMessage;
    } catch (error) {
      console.error(`Error processing commit ${commitHash}:`, error.message);
    }
  }

  // Generate manual instructions or a shell script
  if (Object.keys(commitMessages).length > 0) {
    console.log('\n\n========== HOW TO UPDATE COMMIT MESSAGES ==========');
    console.log('Run these commands manually to update each commit message:');
    console.log(
      "NOTE: This will change commit hashes, so you'll need to force push afterwards.\n",
    );

    // Create an array of commands to execute
    const commands = [];

    // For each commit, provide the command to update it
    Object.keys(commitMessages).forEach((hash) => {
      // Properly escape message for shell script, ensuring outer quotes for the -m string
      const aiMessage = commitMessages[hash];
      // Escape for shell: single quotes become '\'', double quotes become '"'
      const shellEscapedAiMessage = aiMessage
        .replace(/'/g, "'\\''")
        .replace(/"/g, '\\"');

      const commandForDisplay = `git commit --amend -m "${aiMessage.replace(/"/g, '\\"')}" --no-verify && git rebase --continue`;
      console.log(`\n# For commit ${hash.substring(0, 8)}:`);
      console.log(`git checkout ${hash}~0`);
      console.log(`${commandForDisplay}`);

      // Command for the script: use the shell-escaped message directly
      commands.push(
        `echo "Processing commit ${hash.substring(0, 8)}..."`,
        `git checkout ${hash}~0`,
        // The escaped message is directly embedded here. HUSKY=0 and --no-verify are critical.
        `HUSKY=0 git commit --amend -m "${shellEscapedAiMessage}" --no-verify`,
      );
    });

    console.log('\n# After updating all commits:');
    console.log('git checkout <your-branch-name>');
    console.log('git push --force-with-lease origin <your-branch-name>');

    // If the user requested, create an apply script
    if (argv.apply) {
      const scriptPath = path.join(process.cwd(), 'update-commit-messages.sh');

      // Get current branch name
      const currentBranch = execSync('git branch --show-current', {
        shell: '/bin/bash',
      })
        .toString()
        .trim();

      // Create script content
      let scriptContent = `#!/bin/bash\n\n`;
      scriptContent += `# Script to update commit messages\n`;
      scriptContent += `# Generated on ${new Date().toISOString()}\n\n`;
      scriptContent += `# Store the current branch name\n`;
      scriptContent += `CURRENT_BRANCH="${currentBranch}"\n\n`;
      scriptContent += `# Make sure there are no unstaged changes\n`;
      scriptContent += `if [[ -n $(git status -s) ]]; then\n`;
      scriptContent += `  echo "Error: You have unstaged changes. Please commit or stash them first."\n`;
      scriptContent += `  exit 1\n`;
      scriptContent += `fi\n\n`;
      scriptContent += `# Temporarily disable Husky hooks for the script's operations\n`;
      scriptContent += `export HUSKY=0\n\n`;

      // Add the commands
      commands.forEach((cmd) => {
        scriptContent += `${cmd}\n`;
      });

      // After all amends, while still on the detached HEAD at the tip of the rewritten history,
      // force the original branch to point to this new history.
      scriptContent += `\n# Update the original branch to point to the new commit history\n`;
      scriptContent += `git branch -f $CURRENT_BRANCH HEAD\n`;

      // Return to the original branch (which now points to the new history)
      scriptContent += `\n# Return to the original branch\n`;
      scriptContent += `git checkout $CURRENT_BRANCH\n\n`;
      scriptContent += `# Re-enable Husky hooks (optional, as new shells won't inherit HUSKY=0)\n`;
      scriptContent += `# unset HUSKY # or export HUSKY=1\n\n`;
      scriptContent += `echo "All commit messages updated!"\n`;
      scriptContent += `echo "You can now force push with: git push --force-with-lease origin $CURRENT_BRANCH"\n`;

      // Write the script file
      fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 }); // Make executable

      console.log(`\nUpdate script created at: ${scriptPath}`);
      console.log('You can run it with: bash ./update-commit-messages.sh');
    }
  }
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
