/* eslint-disable */
module.exports = {
  displayName: 'nextjs-mf',
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
  coverageDirectory: '../../coverage/packages/nextjs-mf',

  // CI stability improvements
  testTimeout: 30000, // 30 seconds timeout for CI environments
  maxWorkers: process.env.CI ? 2 : undefined, // Limit workers in CI to reduce memory pressure
  forceExit: true, // Force exit to prevent hanging in CI
  detectOpenHandles: false, // Disable to prevent noise in CI logs
};
