/* eslint-disable */
const { readFileSync } = require('fs');

const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.swcrc`, 'utf-8'),
);

if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

module.exports = {
  displayName: 'ai-proxy-remotes-runtime-plugin',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'jsdom',
  coverageDirectory:
    '../../../coverage/packages/runtime-plugins/module-federation-ai-proxy-remotes',
};
