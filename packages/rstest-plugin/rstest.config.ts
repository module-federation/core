import { defineConfig } from '@rstest/core';
import path from 'node:path';

export default defineConfig({
  testEnvironment: 'node',
  globals: true,
  testTimeout: 10_000,
  include: [
    path.resolve(__dirname, 'src/**/*.test.ts'),
    path.resolve(__dirname, 'src/**/*.spec.ts'),
  ],
  exclude: ['**/dist/**', '**/node_modules/**'],
});
