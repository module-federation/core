import { defineConfig } from '@rstest/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    define: {
      __DEV__: true,
      __TEST__: true,
      __BROWSER__: false,
      __VERSION__: '"unknown"',
      __APP_VERSION__: '"0.0.0"',
    },
  },
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  testEnvironment: 'jsdom',
  include: [
    path.resolve(__dirname, 'src/**/*.spec.ts'),
    path.resolve(__dirname, 'src/**/*.spec.tsx'),
  ],
  globals: true,
  testTimeout: 10000,
  setupFiles: [path.resolve(__dirname, '__tests__/setupTests.ts')],
});
