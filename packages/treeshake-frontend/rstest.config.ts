import { defineConfig } from '@rstest/core';
import path from 'node:path';

export default defineConfig({
  testEnvironment: 'node',
  include: [path.resolve(__dirname, 'e2e/**/*.test.ts')],
  globals: true,
  testTimeout: 600000,
  isolate: false,
});
