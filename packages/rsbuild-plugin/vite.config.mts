/// <reference types="vitest" />
import { defineConfig } from 'vite';
import pkg from './package.json';

import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/rsbuild-plugin',
  define: {
    __RSBUILD_PLUGIN_NAME__: JSON.stringify(pkg.name),
  },

  plugins: [tsconfigPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ tsconfigPaths() ],
  // },

  test: {
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
  },
});
