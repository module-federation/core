/* eslint-disable */
const { readFileSync, rmSync } = require('fs');
const path = require('path');
const os = require('os');

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const swcrcRaw = readFileSync(path.join(__dirname, '.swcrc'), 'utf-8');
const swcrcJson = swcrcRaw.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
const { exclude: _, ...swcJestConfig } = JSON.parse(swcrcJson);

rmSync(path.join(__dirname, 'test/js'), { recursive: true, force: true });

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

module.exports = {
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
