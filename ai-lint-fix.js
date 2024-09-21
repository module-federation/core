#!/usr/bin/env node

const { execSync } = require('child_process');
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
  const prompt = `Perform safe cleanup and linting on the following file content. Return only the updated file content with no other response text:

${fileContent}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096,
  });

  return response.choices[0].message.content
    .trim()
    .replace(/^\`/, '')
    .replace(/\`$/, '')
    .trim();
}

async function processFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  try {
    const lintedContent = await lintFileContent(fileContent);
    fs.writeFileSync(filePath, lintedContent, 'utf8');
    console.log(`File has been linted and updated successfully: ${filePath}`);
  } catch (error) {
    console.error(`Error performing linting on ${filePath}:`, error.message);
  }
}

async function main() {
  if (argv.path) {
    await processFile(argv.path);
  } else if (argv.pattern) {
    console.log('pattern', argv.pattern);
    try {
      const files = await glob.glob(argv.pattern);

      for (const filePath of files) {
        await processFile(filePath);
      }
    } catch (err) {
      console.error('Error finding files:', err.message);
      process.exit(1);
    }
  }
  // execSync('nx format:write');
}

main();
