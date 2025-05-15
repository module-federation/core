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
  .option('path', {
    alias: 'p',
    type: 'string',
    description: 'Path to the file or directory',
  })
  .option('staged', {
    alias: 's',
    type: 'boolean',
    description:
      'Use staged changes instead of comparing against the base branch',
    default: false,
  })
  .option('rewrite-branch', {
    alias: 'r',
    type: 'boolean',
    description: 'Rewrite all commit messages in the current branch',
    default: false,
  })
  .help()
  .alias('help', 'h').argv;

// Function to find the nearest package.json and get the package name
function getPackageName(filePath) {
  let dir = filePath;
  while (true) {
    const packageJsonPath = path.join(dir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      if (packageJson.name) {
        return packageJson.name;
      } else {
        console.error(`Package name not found in ${packageJsonPath}`);
        process.exit(1);
      }
    }
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      console.error('Reached root directory without finding package.json');
      process.exit(1);
    }
    dir = parentDir;
  }
}

function sanitizeInput(input) {
  return input.replace(/[^a-zA-Z0-9_\-\/\.]/g, '');
}

function getAllowedScopes() {
  const packagesDir = path.resolve(__dirname, 'packages');
  const scopes = [];

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

async function generateCommitMessage(patch, packageName) {
  const allowedScopes = getAllowedScopes().join(', ');
  const prompt = `Generate a conventional commit message for the following git patch.
RULES:
Never author BREAKING CHANGE messages, they are not allowed.
Message must be less than 100 characters total.
Be concise and direct.
Provide no explanation

Focus on a statement of work of the changes:

${patch}

Allowed scopes: ${allowedScopes}

Please format the commit message as follows:
<type>(<scope>): <subject>`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Generate concise commit messages under 100 characters. Never author BREAKING CHANGE commits.' },
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

function getGitDiffPatch(filePath, useStaged) {
  try {
    const sanitizedFilePath = sanitizeInput(filePath);
    let patch;
    if (useStaged) {
      patch = execSync(`git diff --cached -- "${sanitizedFilePath}"`, {
        shell: '/bin/bash',
      }).toString();
    } else {
      const baseBranch = execSync(
        'git symbolic-ref refs/remotes/origin/HEAD | sed "s@^refs/remotes/origin/@@g" || echo main',
        { shell: '/bin/bash' },
      )
        .toString()
        .trim();
      patch = execSync(`git diff ${baseBranch} -- "${sanitizedFilePath}"`, {
        shell: '/bin/bash',
      }).toString();
    }
    return patch;
  } catch (error) {
    console.error('Error getting git diff:', error.message);
    process.exit(1);
  }
}

// Get list of commits in the current branch excluding merge commits
function getBranchCommits() {
  try {
    const baseBranch = execSync(
      'git symbolic-ref refs/remotes/origin/HEAD | sed "s@^refs/remotes/origin/@@g" || echo main',
      { shell: '/bin/bash' }
    ).toString().trim();

    // Get commits in current branch not in base branch, excluding merge commits
    const output = execSync(
      `git log ${baseBranch}..HEAD --no-merges --format="%H"`,
      { shell: '/bin/bash' }
    ).toString().trim();

    return output ? output.split('\n') : [];
  } catch (error) {
    console.error('Error getting branch commits:', error.message);
    process.exit(1);
  }
}

// Get the diff for a specific commit
function getCommitDiff(commitHash) {
  try {
    return execSync(`git show --patch ${commitHash}`, {
      shell: '/bin/bash',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
    }).toString();
  } catch (error) {
    console.error(`Error getting diff for commit ${commitHash}:`, error.message);
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
      { shell: '/bin/bash' }
    );

    // Remove the temporary file
    fs.unlinkSync(tempFile);
    return true;
  } catch (error) {
    console.error(`Error rewriting message for commit ${commitHash}:`, error.message);
    return false;
  }
}

// Process all commits in the branch
async function processBranchCommits() {
  const commits = getBranchCommits();

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
      console.log(`Processing commit ${commitHash.substring(0, 8)}...`);
      const newMessage = await generateCommitMessage(diff);
      console.log(`New message: ${newMessage}`);

      const success = await rewriteCommitMessage(commitHash, newMessage);
      if (success) {
        console.log(`Updated commit message for ${commitHash.substring(0, 8)}`);
      } else {
        console.log(`Failed to update commit message for ${commitHash.substring(0, 8)}`);
      }
    } catch (error) {
      console.error(`Error processing commit ${commitHash}:`, error.message);
    }
  }

  console.log('Finished processing branch commits.');
}

// Function to generate a random filename
function generateRandomFilename() {
  const adjectives = [
    'quick',
    'lazy',
    'sleepy',
    'noisy',
    'hungry',
    'brave',
    'calm',
    'eager',
    'gentle',
    'happy',
  ];
  const animals = [
    'fox',
    'dog',
    'cat',
    'mouse',
    'owl',
    'tiger',
    'lion',
    'bear',
    'wolf',
    'eagle',
  ];
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  return `ai-${adjective}-${animal}.md`;
}

async function main() {
  if (argv['rewrite-branch']) {
    await processBranchCommits();
    return;
  }

  if (!argv.path) {
    console.error('Path is required when not using --rewrite-branch');
    process.exit(1);
  }

  const filePath = path.resolve(argv.path);

  if (!fs.existsSync(filePath)) {
    console.error(`File or directory not found: ${filePath}`);
    process.exit(1);
  }

  const packageName = getPackageName(filePath);

  const patch = getGitDiffPatch(filePath, argv.staged);

  if (!patch) {
    console.log('No changes detected.');
    process.exit(0);
  }
  try {
    const commitMessage = await generateCommitMessage(patch, packageName);
    console.log('Generated Commit Message:');
    console.log(commitMessage);
  } catch (error) {
    console.error('Error generating commit message:', error.message);
    process.exit(1);
  }
}

main();
