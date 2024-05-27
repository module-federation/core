/// <reference types="vitest" />
import { defineConfig } from 'vite';
import path from 'path';

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/native-federation-tests',

  plugins: [nxViteTsPaths()],

  test: {
    root: __dirname,
    cache: {
      dir: '../../../node_modules/.vitest',
    },
    environment: 'node',
    reporters: ['default'],
    testTimeout: 60000,
  },
});
