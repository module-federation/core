import path from 'path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  define: {
    __DEV__: true,
    __TEST__: true,
    __BROWSER__: false,
    __VERSION__: '"unknown"',
  },
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: [path.resolve(__dirname, '__tests__/*.spec.ts')],
    globals: true,
    testTimeout: 10000,
  },
});
