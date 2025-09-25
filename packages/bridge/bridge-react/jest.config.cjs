module.exports = {
  displayName: 'bridge-react',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        isolatedModules: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/packages/bridge/bridge-react',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'],
  testMatch: [
    '<rootDir>/__tests__/**/*.spec.ts',
    '<rootDir>/__tests__/**/*.spec.tsx',
  ],
};
