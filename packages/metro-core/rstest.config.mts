import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'node',
  include: ['__tests__/**/*.spec.ts', '__tests__/**/*.test.ts'],
  globals: true,
});
