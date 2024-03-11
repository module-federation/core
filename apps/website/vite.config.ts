import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { partytownVite } from '@builder.io/partytown/utils';

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { qwikNxVite } from 'qwik-nx/plugins';
import { join } from 'path';

export default defineConfig({
  cacheDir: '../../node_modules/.vite/apps/website',
  plugins: [
    qwikNxVite(),
    qwikCity(),
    qwikVite({
      client: {
        outDir: '../../dist/apps/website/client',
      },
      ssr: {
        outDir: '../../dist/apps/website/server',
      },
    }),
    tsconfigPaths({ root: '../../' }),
    partytownVite({
      dest: join(
        __dirname,
        '../../',
        'dist',
        'apps',
        'website',
        'client',
        '~partytown',
      ),
    }),
  ],
  server: {
    fs: {
      // Allow serving files from the project root
      allow: ['../../'],
    },
  },
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=600',
    },
  },
  // test: {
  //   globals: true,
  //   cache: {
  //     dir: '../../node_modules/.vitest',
  //   },
  //   environment: 'node',
  //   include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  // },
});
