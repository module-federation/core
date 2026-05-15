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
        // Disabled because runtimePlugin.ts uses webpack globals and
        // untyped hook args that fail strict type-checking.
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/nextjs-mf',
};
