import { defineConfig } from '@rstest/core';

export default defineConfig({
  source: {
    define: {
      __DEV__: true,
      __TEST__: true,
      __BROWSER__: false,
      __VERSION__: '"unknown"',
      __APP_VERSION__: '"0.0.0"',
    },
  },
  testEnvironment: 'jsdom',
  include: ['src/**/*.spec.ts', '__tests__/**/*.spec.ts'],
  globals: true,
  testTimeout: 10000,
});
