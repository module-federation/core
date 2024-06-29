import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __DEV__: true,
    __TEST__: true,
    __BROWSER__: false,
    __VERSION__: '"unknown"',
  },
  test: {
    environment: 'jsdom',
    include: ['__tests__/*.spec.ts'],
    alias: {
      ['@/']: './',
      ['@src']: './src',
    },
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    testTimeout: 10000,
  },
});
