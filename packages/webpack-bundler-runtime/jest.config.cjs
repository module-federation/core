// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  testEnvironment: 'jsdom',
  coveragePathIgnorePatterns: ['__tests__', '/node_modules/'],
  coverageProvider: 'v8',
  coverageReporters: ['cobertura', 'clover', 'json', 'lcov', 'text'],
  globals: {
    __DEV__: true,
    __TEST__: true,
    __BROWSER__: false,
    __VERSION__: '"unknown"',
  },
  preset: 'ts-jest',
  transformIgnorePatterns: [
    // Change MODULE_NAME_HERE to your module that isn't being compiled
    '/node_modules/(?!((@byted/garfish-)|(byted-tea-sdk))).+\\.js$',
  ],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  rootDir: __dirname,
  testMatch: ['<rootDir>__tests__/**/**.spec.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/'],
};
