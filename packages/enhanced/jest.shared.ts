/* eslint-disable */
import { readFileSync, rmdirSync, existsSync } from 'fs';
import path from 'path';

const { exclude: _, ...swcJestConfig } = JSON.parse(
  readFileSync(`${__dirname}/.swcrc`, 'utf-8'),
);

if (existsSync(__dirname + '/test/js')) {
  rmdirSync(__dirname + '/test/js', { recursive: true });
}

if (swcJestConfig.swcrc === undefined) {
  swcJestConfig.swcrc = false;
}

const sharedConfig = {
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/packages/enhanced',
  rootDir: __dirname,
  testEnvironment: path.resolve(__dirname, './test/patch-node-env.js'),
  setupFilesAfterEnv: ['<rootDir>/test/setupTestFramework.js'],
};

export default sharedConfig;
