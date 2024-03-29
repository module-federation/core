/* eslint-disable */
import { readFileSync, rmdirSync, existsSync } from 'fs';
import path from 'path';

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.swcrc`, 'utf-8'),
);

if (existsSync(__dirname + '/test/js')) {
  rmdirSync(__dirname + '/test/js', { recursive: true });
}

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

// Uncomment if using global setup/teardown files being transformed via swc
// https://nx.dev/packages/jest/documents/overview#global-setup/teardown-with-nx-libraries
// jest needs EsModule Interop to find the default exported setup/teardown functions
// swcJestConfig.module.noInterop = false;

export default {
  displayName: 'enhanced',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'json'],
  coverageDirectory: '../../coverage/packages/enhanced',
  rootDir: __dirname,
  testMatch: [
    '<rootDir>/test/*.test.js',
    '<rootDir>/test/*.basictest.js',
    '<rootDir>/test/*.longtest.js',
    '<rootDir>/test/*.unittest.js',
  ],
  testEnvironment: path.resolve(__dirname, './test/patch-node-env.js'),
  setupFilesAfterEnv: ['<rootDir>/test/setupTestFramework.js'],
};
