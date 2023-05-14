#!/usr/bin/env node

const { runGenerativeCommit } = require('./commit');
const { generatePullRequestSummary } = require('./pull-request');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const processFile = require('./file');

dotenv.config();
const argv = yargs(hideBin(process.argv)).argv;

if (argv.pr) {
  generatePullRequestSummary();
} else if (argv.commit) {
  runGenerativeCommit();
} else if (argv.file && argv.question) {
  console.log('Processing file...');
  processFile(argv.file, argv.question);
}
