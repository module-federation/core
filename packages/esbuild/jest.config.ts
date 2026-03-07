import { readFileSync } from 'fs';

const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.swcrc`, 'utf-8'),
);

swcJestConfig.swcrc ??= false;

export default {
  clearMocks: true,
  cache: false,
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['__tests__', '/node_modules/', '/dist/'],
  globals: {
    __VERSION__: '"0.0.0-test"',
    FEDERATION_DEBUG: '""',
  },
  preset: 'ts-jest',
  transformIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', swcJestConfig],
  },
  rootDir: __dirname,
  testMatch: [
    '<rootDir>/src/**/*.spec.[jt]s?(x)',
    '<rootDir>/src/**/*.test.[jt]s?(x)',
  ],
  testPathIgnorePatterns: ['/node_modules/'],
};
