/* eslint-disable */
const { readFileSync } = require('fs');
const path = require('path');
const os = require('os');
const rimraf = require('rimraf');

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _omit, ...swcJestConfig } = JSON.parse(
  readFileSync(path.join(__dirname, '.swcrc'), 'utf-8'),
);

rimraf.sync(path.join(__dirname, 'test/js'));

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig
// ourselves. If we do not disable this, SWC Core will read .swcrc and won't
// transform our test files due to "exclude".
if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

/** @type {import('jest').Config} */
const config = {
  displayName: 'enhanced',
  preset: '../../jest.preset.js',
  cacheDirectory: path.join(os.tmpdir(), 'enhanced'),
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/enhanced',
  rootDir: __dirname,
  testMatch: [
    '<rootDir>/test/*.basictest.js',
    '<rootDir>/test/unit/**/*.test.ts',
  ],
  silent: true,
  verbose: false,
  testEnvironment: path.resolve(__dirname, './test/patch-node-env.js'),
  setupFilesAfterEnv: ['<rootDir>/test/setupTestFramework.js'],
};

module.exports = config;
