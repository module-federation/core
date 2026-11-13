/* eslint-disable */
module.exports = {
  displayName: 'node',
  preset: '../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.[tj]sx?$': ['@swc/jest'],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/node',
};
