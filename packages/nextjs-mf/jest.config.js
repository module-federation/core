/* eslint-disable */
const jestConfig = {
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
  forceExit: true, // Force exit to prevent hanging in CI
  detectOpenHandles: false, // Disable to prevent noise in CI logs
};

// Only set maxWorkers if in CI environment
if (process.env['CI']) {
  jestConfig.maxWorkers = 2; // Limit workers in CI to reduce memory pressure
}

module.exports = jestConfig;
