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
    description: 'Run only against the staged files',
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

async function generateChangeset(patch, packageName) {
  const prompt = `Generate a concise changeset for the following git patch. Focus on the main purpose of the changes and their impact:

${patch}

Please format the changeset as follows:
---
"${packageName}": patch|minor|major
---

<!--- A Brief statement or sentence of the changes  --->
Statement of changes.

<!--- Key changes and points as a list, be specific  --->
- Key change 1
  - optional sub-point 1
  - optional sub-point 2
- Key change 2
- Key change 3
- Key change 4

Only return the changeset, nothing else.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
  });

  return response.choices[0].message.content
    .trim()
    .replace('```markdown', '')
    .replace('```', '')
    .replace(/<!--[\s\S]*?-->\n?/g, '')
    .replace(/<\/?[^>]+(>|$)/g, '') // Remove all HTML tags
    .trim();
}

function getGitDiffPatch(filePath) {
  try {
    const sanitizedFilePath = sanitizeInput(filePath);
    const baseBranch = execSync(
      'git symbolic-ref refs/remotes/origin/HEAD | sed "s@^refs/remotes/origin/@@g" || echo main',
    )
      .toString()
      .trim();
    const diffCommand = argv.staged
      ? `git diff --cached -- "${sanitizedFilePath}"`
      : `git diff ${baseBranch} -- "${sanitizedFilePath}"`;
    const patch = execSync(diffCommand).toString();
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

  const patch = getGitDiffPatch(filePath);

  if (!patch) {
    console.log('No changes detected.');
    process.exit(0);
  }
  try {
    const changeset = await generateChangeset(patch, packageName);
    console.log('Generated Changeset:');
    console.log(changeset);

    const changesetsDir = path.resolve('.changeset');
    if (!fs.existsSync(changesetsDir)) {
      fs.mkdirSync(changesetsDir);
    }

    const filename = generateRandomFilename();
    const fileFullPath = path.join(changesetsDir, filename);

    fs.writeFileSync(fileFullPath, changeset);
    console.log(`Changeset written to ${fileFullPath}`);
  } catch (error) {
    console.error('Error generating changeset:', error.message);
    process.exit(1);
  }
}

main();
