import { defineConfig } from '@rstest/core';
import path from 'node:path';

export default defineConfig({
  testEnvironment: 'node',
  include: [path.resolve(__dirname, 'test/**/*.test.ts')],
  globals: true,
  testTimeout: 600000,
});
