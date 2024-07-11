import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import path from 'path';
export default defineConfig({
  define: {
    __DEV__: true,
    __TEST__: true,
    __BROWSER__: false,
    __VERSION__: '"unknown"',
  },
  plugins: [nxViteTsPaths()],
  test: {
    cache: { dir: path.resolve(__dirname, 'node_modules/.vite/auto-preload') },
    environment: 'jsdom',
    include: [path.resolve(__dirname, '__tests__/*.spec.ts')],
    globals: true,
    setupFiles: [path.resolve(__dirname, './__tests__/setup.ts')],
    testTimeout: 10000,
  },
});
