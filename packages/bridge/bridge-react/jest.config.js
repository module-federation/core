module.exports = {
  displayName: 'bridge-react',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
          target: 'es2022',
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@module-federation/bridge-react/router-runtime$':
      '<rootDir>/src/remote/router-component/router-runtime.ts',
    '^react-router/dom$': '<rootDir>/__tests__/react-router-dom-subpath.ts',
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
