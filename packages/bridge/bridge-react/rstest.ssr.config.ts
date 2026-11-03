import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'node',
  include: ['src/ssr-stream/**/*.spec.ts'],
  testTimeout: 10000,
});
