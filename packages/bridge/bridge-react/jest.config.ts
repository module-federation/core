export default {
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
  moduleNameMapper: {
    '^@module-federation/bridge-react/router-runtime$':
      '<rootDir>/src/remote/router-component/router-runtime.ts',
    '^react-router/dom$':
      '<rootDir>/node_modules/react-router/dist/development/dom-export.js',
    '^react-router/dist/development/dom-export\\.js$':
      '<rootDir>/node_modules/react-router/dist/development/dom-export.js',
  },
  coverageDirectory: '../../../coverage/packages/bridge/bridge-react',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setupTests.ts'],
  testMatch: [
    '<rootDir>/__tests__/**/*.spec.ts',
    '<rootDir>/__tests__/**/*.spec.tsx',
  ],
};
