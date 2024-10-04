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
    demandOption: true,
  })
  .option('staged', {
    alias: 's',
    type: 'boolean',
    description:
      'Use staged changes instead of comparing against the base branch',
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
Body's lines must not be longer than 100 characters [body-max-line-length]
Provide no explanation

Focus on a statement of work of the changes:

${patch}

Allowed scopes: ${allowedScopes}

Please format the commit message as follows:
<type>(<scope>): <subject>

<body>

<footer>`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'never author BREAKING CHANGE commits' },
      { role: 'user', content: prompt },
    ],
    max_tokens: 200,
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
