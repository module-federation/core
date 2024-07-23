/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'path';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  cacheDir: '../../node_modules/.vitest/dts-plugin',

  plugins: [nxViteTsPaths()],

  test: {
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.spec.ts',
    ],
    reporters: ['default'],
    testTimeout: 60000,
    setupFiles: [path.resolve(__dirname, './tests/setup.ts')],
  },
});
