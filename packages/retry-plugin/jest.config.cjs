/* eslint-disable */
const { readFileSync } = require('fs');
const path = require('path');

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const swcrcRaw = readFileSync(path.join(__dirname, '.swcrc'), 'utf-8');
const swcrcJson = swcrcRaw.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
const { exclude: _, ...swcJestConfig } = JSON.parse(swcrcJson);

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

module.exports = {
  displayName: 'runtime',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/packages/runtime',
};
