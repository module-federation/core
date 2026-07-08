import { defineConfig } from '@rstest/core';

export default defineConfig({
  source: {
    define: {
      __DEV__: true,
      __TEST__: true,
      __BROWSER__: false,
      __VERSION__: '"unknown"',
    },
  },
  testEnvironment: 'jsdom',
  include: ['__tests__/*.spec.ts'],
  resolve: {
    alias: {
      '@/': './',
      '@src': './src',
    },
  },
  globals: true,
  setupFiles: ['./__tests__/setup.ts'],
  testTimeout: 10000,
});
