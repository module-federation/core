import { defineConfig } from '@rstest/core';

export default defineConfig({
  testEnvironment: 'node',
  include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  reporters: ['default'],
  passWithNoTests: true,
});
