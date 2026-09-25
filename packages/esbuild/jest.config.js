const { readFileSync } = require('fs');

const swcrc = JSON.parse(readFileSync(`${__dirname}/.swcrc`, 'utf-8'));
const swcConfigIncludingTests = { ...swcrc, exclude: [], swcrc: false };

module.exports = {
  displayName: 'esbuild',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcConfigIncludingTests],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
  coverageDirectory: '../../coverage/packages/esbuild',
};
