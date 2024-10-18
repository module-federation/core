#!/usr/bin/env node

const { execSync, execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const glob = require('glob');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Parse command line arguments
const argv = yargs(hideBin(process.argv))
  .option('pattern', {
    alias: 'p',
    type: 'string',
    description: 'Glob pattern to match files',
  })
  .option('path', {
    alias: 'f',
    type: 'string',
    description: 'Path to a specific file',
  })
  .check((argv) => {
    if (!argv.pattern && !argv.path) {
      throw new Error('You must provide either a --pattern or --path argument');
    }
    return true;
  })
  .help()
  .alias('help', 'h').argv;

async function lintFileContent(fileContent) {
  const prompt = `Perform safe cleanup and linting on the following file content.
RULES:
-Should preserve uses of normalizeWebpackPath
-Should preserve uses of ts-ignore
-Should improve the source code while ensuing its logic is preserved and functionality is not altered
-Update existing comments for accuracy
-Return only the updated file content with no other response text:

${fileContent}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_completion_tokens: 4096,
  });

  let res = response.choices[0].message.content.trim().split('\n');
  if (res[0].startsWith('`')) {
    res[0] = undefined;
  }

  if (res[res.length - 1].startsWith('`')) {
    res[res.length - 1] = undefined;
  }

  return res.filter((r) => r).join('\n');
}

async function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  try {
    const lintedContent = await lintFileContent(fileContent);
    fs.writeFileSync(filePath, lintedContent, 'utf8');
    console.log(`File has been linted and updated successfully: ${filePath}`);
  } catch (error) {
    console.error(`Error performing linting on ${filePath}:`, error.message);
    process.exit(1);
  }
}

function findTsConfig(filePath) {
  let dir = path.dirname(filePath);
  while (dir !== path.resolve(dir, '..')) {
    const tsConfigPath = path.join(dir, 'tsconfig.json');
    if (fs.existsSync(tsConfigPath)) {
      return tsConfigPath;
    }
    dir = path.resolve(dir, '..');
  }
  throw new Error('tsconfig.json not found');
}

async function processFilesWithConcurrencyLimit(files, limit) {
  const results = [];
  const executing = [];

  for (const file of files) {
    const p = processFile(file).then(() => {
      executing.splice(executing.indexOf(p), 1);
    });
    results.push(p);
    executing.push(p);
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

async function main() {
  if (argv.path) {
    await processFile(argv.path);
  } else if (argv.pattern) {
    console.log('pattern', argv.pattern);
    try {
      const files = await glob.glob(argv.pattern);
      await processFilesWithConcurrencyLimit(files, 3); // Process files with concurrency limit of 3
    } catch (err) {
      console.error('Error finding files:', err.message);
      process.exit(1);
    }
  }
  execSync('nx format:write');
}

main();
