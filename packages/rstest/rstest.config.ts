import { defineConfig } from '@rstest/core';
import path from 'node:path';

export default defineConfig({
  testEnvironment: 'node',
  testTimeout: 10_000,
  include: [
    path.resolve(__dirname, 'src/**/*.test.ts'),
    path.resolve(__dirname, 'src/**/*.spec.ts'),
  ],
});
