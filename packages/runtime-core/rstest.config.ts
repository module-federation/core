import { defineConfig } from '@rstest/core';
import path from 'path';

export default defineConfig({
  source: {
    define: {
      __DEV__: true,
      __TEST__: true,
      __BROWSER__: false,
      __VERSION__: '"unknown"',
    },
  },
  resolve: {
    alias: {
      '#mf/remote-module': path.resolve(
        __dirname,
        'src/selectors/remote-module/legacy.ts',
      ),
      '#mf/remote-entry': path.resolve(
        __dirname,
        'src/selectors/remote-entry/legacy.ts',
      ),
      '#mf/remote-handler': path.resolve(
        __dirname,
        'src/selectors/remote-handler/legacy.ts',
      ),
      '#mf/shared-handler': path.resolve(
        __dirname,
        'src/selectors/shared-handler/legacy.ts',
      ),
      '#mf/snapshot-handler': path.resolve(
        __dirname,
        'src/selectors/snapshot-handler/legacy.ts',
      ),
      '#mf/default-plugins': path.resolve(
        __dirname,
        'src/selectors/default-plugins/legacy.ts',
      ),
      '#mf/share-config': path.resolve(
        __dirname,
        'src/selectors/share-config/legacy.ts',
      ),
      '#mf/share-utils': path.resolve(
        __dirname,
        'src/selectors/share-utils/legacy.ts',
      ),
      '#mf/preload': path.resolve(__dirname, 'src/selectors/preload/legacy.ts'),
    },
  },
  testEnvironment: 'jsdom',
  include: [path.resolve(__dirname, '__tests__/*.spec.ts')],
  globals: true,
  setupFiles: [path.resolve(__dirname, './__tests__/setup.ts')],
  testTimeout: 10000,
});
