import { defineConfig } from '@rstest/core';
import path from 'path';

export default defineConfig({
  testEnvironment: 'node',
  include: [path.resolve(__dirname, '__tests__/**.test.ts')],
  globals: true,
  testTimeout: 10000,
});
