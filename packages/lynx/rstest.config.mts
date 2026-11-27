import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'node',
  include: ['src/**/*.{test,spec}.ts'],
  reporters: ['default'],
});
