#!/usr/bin/env node

const { runGenerativeCommit } = require('./commit');
const { generatePullRequestSummary } = require('./pull-request');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
const { execSync } = require('child_process');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

dotenv.config();
const argv = yargs(hideBin(process.argv)).argv;
if (argv.pr) {
  generatePullRequestSummary();
} else if (argv.commit) {
  runGenerativeCommit();
}
