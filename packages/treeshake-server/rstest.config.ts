import { defineConfig } from '@rstest/core';
import path from 'node:path';

export default defineConfig({
  testEnvironment: 'node',
  include: [path.resolve(__dirname, 'test/**/*.test.ts')],
  exclude: [path.resolve(__dirname, 'test/e2e/cli.embedded.test.ts')],
  globals: true,
  testTimeout: 600000,
});
