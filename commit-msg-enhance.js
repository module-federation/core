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
  const scopes = [];
  const workspaceRoot = path.resolve(__dirname);
  console.log(
    `[getAllowedScopes] Resolved workspace root to: ${workspaceRoot}`,
  );

  function findProjectJsonFiles(dir) {
    if (!fs.existsSync(dir)) {
      console.log(
        `[getAllowedScopes] Directory does not exist, skipping: ${dir}`,
      );
      return;
    }
    try {
      fs.readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
        const fullPath = path.join(dir, dirent.name);
        if (dirent.isDirectory()) {
          if (
            dirent.name === 'node_modules' ||
            dirent.name === '.git' ||
            dirent.name === '.nx' ||
            dirent.name === 'dist' ||
            dirent.name === 'build' ||
            dirent.name.startsWith('.')
          ) {
            return;
          }
          const projectJsonPath = path.join(fullPath, 'project.json');
          if (fs.existsSync(projectJsonPath)) {
            console.log(
              `[getAllowedScopes] Found project.json at: ${projectJsonPath}`,
            );
            try {
              const projectJson = JSON.parse(
                fs.readFileSync(projectJsonPath, 'utf8'),
              );
              if (projectJson.name) {
                scopes.push(projectJson.name);
                console.log(
                  `[getAllowedScopes] Added scope: ${projectJson.name}`,
                );
              } else {
                console.warn(
                  `[getAllowedScopes] Warning: No name found in ${projectJsonPath}`,
                );
              }
            } catch (e) {
              console.warn(
                `[getAllowedScopes] Warning: Could not parse ${projectJsonPath}: ${e.message}`,
              );
            }
          } else {
            findProjectJsonFiles(fullPath);
          }
        }
      });
    } catch (readDirError) {
      console.error(
        `[getAllowedScopes] Error reading directory ${dir}: ${readDirError.message}`,
      );
    }
  }

  const dirsToScan = ['apps', 'packages', 'libs'];
  dirsToScan.forEach((d) => {
    const scanDir = path.join(workspaceRoot, d);
    console.log(`[getAllowedScopes] Scanning directory: ${scanDir}`);
    findProjectJsonFiles(scanDir);
  });

  const uniqueScopes = [...new Set(scopes)];
  console.log(
    `[getAllowedScopes] Found unique scopes: ${uniqueScopes.join(', ')}`,
  );
  return uniqueScopes;
}

async function generateCommitMessage(patch) {
  const allowedScopes = getAllowedScopes().join(', ');
  const prompt = `Generate a conventional commit message for the following git patch.
RULES:
Never author BREAKING CHANGE messages, they are not allowed.
Message must be less than 100 characters total.
Be concise and direct.
Provide no explanation
Use ONLY the provided "Allowed scopes" if a scope is applicable. If no provided scope fits, you can use a general scope like 'core', 'common', 'utils', or omit the scope if necessary for conciseness.
Ensure the entire commit message (type, scope, subject) is under 100 characters.

Focus on a statement of work of the changes:

${patch}

${allowedScopes.length > 0 ? `Allowed scopes: ${allowedScopes}` : 'No specific project scopes found; use general scopes like core, ci, build, utils, docs or omit if not applicable.'}

Please format the commit message as follows:
<type>(<scope>): <subject>`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          "Generate concise conventional commit messages under 100 characters. Adhere strictly to the provided 'Allowed scopes'. If no provided scope fits, use general scopes like 'core', 'common', 'utils', or omit the scope. Never author BREAKING CHANGE commits.",
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 100,
    temperature: 0.5,
  });

  let message = response.choices[0].message.content
    .trim()
    .replace(/[\`]{3}markdown|[\`]{3}/g, '')
    .trim()
    .replace(/^[\`\"\']|[\`\"\']$/g, '') // Remove leading/trailing backticks, quotes (single or double)
    .trim();

  message = message.replace(
    /^([Cc][Hh][Oo][Rr][Ee]|[Ff][Ee][Aa][Tt]|[Ff][Ii][Xx]|[Dd][Oo][Cc][Ss]|[Ss][Tt][Yy][Ll][Ee]|[Rr][Ee][Ff][Aa][Cc][Tt][Oo][Rr]|[Pp][Ee][Rr][Ff]|[Tt][Ee][Ss][Tt])(\s*)(\(|:)/,
    (match, p1, p2, p3) => {
      return p1.toLowerCase() + (p3 === '(' ? p3 : ':');
    },
  );

  // Ensure scope is lowercase if present
  message = message.replace(
    /^(\w+\()([^)]+)(\))/,
    (match, prefixAndOpenParen, scope, closeParen) => {
      return `${prefixAndOpenParen}${scope.toLowerCase()}${closeParen}`;
    },
  );

  // Ensure there's a space after the colon following type or scope
  message = message.replace(/^([\w()]+:)([^\s])/, '$1 $2');

  return message;
}

function getBranchCommits(baseBranch) {
  try {
    if (!baseBranch) {
      try {
        baseBranch = execSync(
          'git symbolic-ref refs/remotes/origin/HEAD | sed "s@^refs/remotes/origin/@@g"',
          { shell: '/bin/bash', stdio: 'pipe' },
        )
          .toString()
          .trim();
      } catch (e) {
        try {
          execSync('git rev-parse --verify origin/master', { stdio: 'pipe' });
          baseBranch = 'master';
        } catch (masterErr) {
          baseBranch = 'main';
        }
        console.log(
          `[getBranchCommits] Default remote HEAD not found or ambiguous, trying base branch: ${baseBranch}`,
        );
      }
    }

    console.log(
      `[getBranchCommits] Using base branch for comparison: origin/${baseBranch}`,
    );

    const headCommit = execSync('git rev-parse HEAD', { shell: '/bin/bash' })
      .toString()
      .trim();
    console.log(`[getBranchCommits] Current HEAD is: ${headCommit}`);

    const command = `git log origin/${baseBranch}..${headCommit} --no-merges --format="%H" --reverse`;
    console.log(`[getBranchCommits] Executing: ${command}`);
    const output = execSync(command, { shell: '/bin/bash' }).toString().trim();

    const commits = output ? output.split('\n') : [];
    console.log(
      `[getBranchCommits] Found ${commits.length} commits to process (oldest first): ${commits.join(', ')}`,
    );
    return commits;
  } catch (error) {
    console.error(
      '[getBranchCommits] Error getting branch commits:',
      error.message,
    );
    console.error('Stderr:', error.stderr ? error.stderr.toString() : 'N/A');
    process.exit(1);
  }
}

function getCommitDiff(commitHash) {
  try {
    return execSync(
      `git show --patch ${commitHash} ":(exclude)pnpm-lock.yaml"`,
      {
        shell: '/bin/bash',
        maxBuffer: 10 * 1024 * 1024,
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

async function processBranchCommits() {
  let gitDir;
  try {
    // Assuming process.cwd() is the root of the git repository where the script is run.
    // git rev-parse --git-dir typically returns '.git' if at the root.
    gitDir = execSync('git rev-parse --git-dir', {
      shell: '/bin/bash',
      stdio: 'pipe',
    })
      .toString()
      .trim();
  } catch (e) {
    console.error(
      'Error: Failed to determine .git directory. Ensure you are running this script within a git repository.',
      e.message,
    );
    process.exit(1);
  }

  // Resolve indexLockPath: .git is always under toplevel
  const workspaceRootPath = execSync('git rev-parse --show-toplevel', {
    shell: '/bin/bash',
    stdio: 'pipe',
  })
    .toString()
    .trim();
  const indexLockPath = path.join(workspaceRootPath, '.git', 'index.lock');

  if (fs.existsSync(indexLockPath)) {
    console.error(`\\nError: Git index lock file found at '${indexLockPath}'.`);
    console.error(
      'This usually means another git process is running (e.g., an IDE, a terminal where a git command is active), or a previous git operation crashed.',
    );
    console.error(
      'Please ensure all other git processes are terminated for this repository. If you are certain no other git process is active, you might need to manually remove the lock file: ' +
        indexLockPath,
    );
    console.error('Aborting script to prevent further issues.\\n');
    process.exit(1);
  }

  const chronologicalCommits = getBranchCommits(argv['base-branch']);

  if (chronologicalCommits.length === 0) {
    console.log('No commits found in this branch to process.');
    return;
  }

  console.log(
    `Found ${chronologicalCommits.length} commits to process (oldest to newest).`,
  );

  const commitMessages = {};

  for (const originalHash of chronologicalCommits) {
    const diff = getCommitDiff(originalHash);
    if (!diff) {
      console.warn(
        `Skipping commit ${originalHash} as no diff could be obtained.`,
      );
      continue;
    }

    try {
      const originalMessage = execSync(
        `git log -1 --format=%B ${originalHash}`,
        {
          shell: '/bin/bash',
        },
      )
        .toString()
        .trim();

      console.log(
        `\nProcessing original commit ${originalHash.substring(0, 8)}...`,
      );
      console.log(`Original message: ${originalMessage}`);

      const newMessage = await generateCommitMessage(diff);
      console.log(`New AI message: ${newMessage}`);

      commitMessages[originalHash] = newMessage;
    } catch (error) {
      console.error(`Error processing commit ${originalHash}:`, error.message);
    }
  }

  if (Object.keys(commitMessages).length === 0) {
    console.log('No commit messages were successfully generated. Exiting.');
    return;
  }

  console.log('\n\n========== HOW TO UPDATE COMMIT MESSAGES ==========');

  if (!argv.apply) {
    console.log(
      'Run with --apply to generate an executable script to apply these changes.',
    );
    console.log(
      'Manual cherry-pick + amend sequence would be complex. Use --apply.',
    );
    Object.keys(commitMessages).forEach((originalHash) => {
      console.log(
        `For original commit ${originalHash.substring(0, 8)} -> New message: "${commitMessages[originalHash]}"`,
      );
    });
    return;
  }

  const scriptPath = path.join(process.cwd(), 'update-commit-messages.sh');
  const currentBranch = execSync('git branch --show-current', {
    shell: '/bin/bash',
  })
    .toString()
    .trim();

  let scriptContent = `#!/bin/bash
# Shell script to rewrite commit history with new messages
# Generated on ${new Date().toISOString()}
set -e

export HUSKY=0

CURRENT_BRANCH="${currentBranch}"
ORIGINAL_BRANCH_TIP_FOR_DIAG=$(git rev-parse HEAD)

echo "Current branch: ${currentBranch}"
echo "Original tip of ${currentBranch} (before script execution): ${ORIGINAL_BRANCH_TIP_FOR_DIAG}"

if [[ -n $(git status -s) ]]; then
  echo "Error: You have unstaged changes. Please commit or stash them first."
  exit 1
fi

BASE_FOR_REWRITE=$(git rev-parse "${chronologicalCommits[0]}^")
echo "Starting rewrite from base commit: ${BASE_FOR_REWRITE}"

git checkout "${BASE_FOR_REWRITE}"
echo "Checked out base ${BASE_FOR_REWRITE} in a detached HEAD state."
`;

  chronologicalCommits.forEach((originalHash) => {
    const aiMessage = commitMessages[originalHash];
    if (!aiMessage) {
      scriptContent += `\necho "Skipping original commit ${originalHash.substring(0, 8)} as no new message was generated for it."\n`;
      return;
    }
    const shellEscapedAiMessage = aiMessage
      .replace(/'/g, "'\\''")
      .replace(/"/g, '\\"')
      .replace(/`/g, '\\`');

    scriptContent += `\necho "\nProcessing original commit ${originalHash.substring(0, 8)}..."`;
    scriptContent += `\necho "Cherry-picking ${originalHash} onto current HEAD (\$(git rev-parse --short HEAD))"`;
    scriptContent += `\ngit cherry-pick ${originalHash}`;
    scriptContent += `\necho "Amending just-picked commit with new message: ${aiMessage.replace(/"/g, '\\"')}"`; // for echo, escape only double quotes
    scriptContent += `\ngit commit --amend -m "${shellEscapedAiMessage}" --no-verify`;
  });

  scriptContent += `\n\n# Rewrite complete. Current HEAD is the tip of the new history.`;
  scriptContent += `\nNEW_HISTORY_TIP=$(git rev-parse HEAD)`;
  scriptContent += `\necho "New history tip is at: ${NEW_HISTORY_TIP}"`;

  scriptContent += `\n\n# --- DIAGNOSTIC LOGGING --- #`;
  scriptContent += `\necho "[DIAG] HEAD after all amends is at: ${NEW_HISTORY_TIP}"`;
  scriptContent += `\necho "[DIAG] Original ${currentBranch} was at: ${ORIGINAL_BRANCH_TIP_FOR_DIAG}"`;
  scriptContent += `\necho "[DIAG] About to force ${currentBranch} to point to ${NEW_HISTORY_TIP}..."`;
  scriptContent += `\n# --- END DIAGNOSTIC LOGGING --- #`;

  scriptContent += `\n\n# Update the original branch to point to the new commit history`;
  scriptContent += `\ngit branch -f "${currentBranch}" "${NEW_HISTORY_TIP}"`;

  scriptContent += `\n\n# --- DIAGNOSTIC LOGGING --- #`;
  scriptContent += `\necho "[DIAG] ${currentBranch} is NOW at: $(git rev-parse ${currentBranch})"`;
  scriptContent += `\necho "[DIAG] HEAD (still detached) is at: ${NEW_HISTORY_TIP}"`;
  scriptContent += `\necho "[DIAG] About to checkout ${currentBranch}..."`;
  scriptContent += `\n# --- END DIAGNOSTIC LOGGING --- #`;

  scriptContent += `\n\n# Return to the original branch (which now points to the new history)`;
  scriptContent += `\ngit checkout "${currentBranch}"`;

  scriptContent += `\n\n# --- DIAGNOSTIC LOGGING --- #`;
  scriptContent += `\necho "[DIAG] After checkout, HEAD is at: $(git rev-parse HEAD)"`;
  scriptContent += `\necho "[DIAG] After checkout, ${currentBranch} is at: $(git rev-parse ${currentBranch})"`;
  scriptContent += `\n# --- END DIAGNOSTIC LOGGING --- #`;

  scriptContent += `\n\necho "All targeted commit messages updated on branch '${currentBranch}'!"`;
  scriptContent += `\necho "IMPORTANT: Review the new history carefully."`;
  scriptContent += `\necho "If correct, you will need to force push these changes: git push --force-with-lease origin ${currentBranch}"`;

  fs.writeFileSync(scriptPath, scriptContent, { mode: 0o755 });
  console.log(`\nUpdate script created at: ${scriptPath}`);
  console.log(`You can run it with: bash ${scriptPath}`);
}

async function main() {
  try {
    await processBranchCommits();
  } catch (error) {
    console.error('Error in main execution:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
