import { defineConfig } from '@rstest/core';
import path from 'path';

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
  include: [
    path.resolve(__dirname, '__tests__/*.spec.ts'),
    path.resolve(__dirname, '__tests__/*.spec.tsx'),
  ],
  globals: true,
  testTimeout: 10000,
});
