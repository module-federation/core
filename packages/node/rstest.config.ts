import { defineConfig } from '@rstest/core';
import path from 'node:path';

export default defineConfig({
  source: { define: { __VERSION__: '"test"', __DEV__: true, __TEST__: true } },
  resolve: {
    alias: {
      '@module-federation/runtime/helpers$': path.resolve(
        __dirname,
        '../runtime-core/src/helpers.ts',
      ),
    },
  },
  testEnvironment: 'jsdom',
  globals: true,
  include: ['src/__tests__/*.spec.ts'],
  setupFiles: [path.resolve(__dirname, '../runtime-core/__tests__/setup.ts')],
  testTimeout: 10000,
});
