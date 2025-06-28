/* eslint-disable */
module.exports = {
  displayName: 'node',
  preset: '../../jest.preset.js',
  globals: {},
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/node',
  // Add experimental VM modules support for HMR testing
  testRunner: 'jest-circus/runner',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};
