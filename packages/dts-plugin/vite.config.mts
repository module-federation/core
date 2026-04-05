/// <reference types="vitest" />
import { defineConfig } from 'vite';

import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vitest/dts-plugin',

  plugins: [tsconfigPaths()],

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
    globalSetup: ['./tests/setup.ts'],
  },
});
