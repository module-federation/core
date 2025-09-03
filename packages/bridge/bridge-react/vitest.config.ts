import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
  define: {
    __DEV__: true,
    __TEST__: true,
    __BROWSER__: false,
    __VERSION__: '"unknown"',
    __APP_VERSION__: '"0.0.0"',
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  plugins: [react(), nxViteTsPaths()],
  test: {
    environment: 'jsdom',
    include: [
      path.resolve(__dirname, '__tests__/*.spec.ts'),
      path.resolve(__dirname, '__tests__/*.spec.tsx'),
    ],
    globals: true,
    testTimeout: 10000,
    setupFiles: [path.resolve(__dirname, '__tests__/setupTests.ts')],
  },
});
