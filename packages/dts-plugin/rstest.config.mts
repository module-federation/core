import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'node',
  include: [
    'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    'tests/**/*.spec.ts',
  ],
  reporters: ['default'],
  testTimeout: 60000,
  globalSetup: ['./tests/setup.ts'],
  passWithNoTests: true,
});
