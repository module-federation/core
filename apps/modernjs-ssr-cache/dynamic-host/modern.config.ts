import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  server: { port: 3061, ssr: { mode: 'stream' } },
  output: { disableTsChecker: true },
  source: {
    disableDefaultEntries: true,
    entries: { index: 'src/routes', b: 'src/b' },
  },
  // Shared server chunks cannot initialize these MPA entries in the current preview.
  tools: {
    rspack(config, { isServer }) {
      if (isServer) config.optimization.splitChunks = false;
    },
  },
  plugins: [
    appTools(),
    moduleFederationPlugin({
      ssr: { cacheUpdates: true },
      config: {
        name: 'lab_dynamic',
        dts: false,
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
        },
        remotes: {
          remote:
            'r6_remote@' +
            (process.env.SSR_CACHE_ASSET_URL || 'http://127.0.0.1:3066') +
            '/v1/mf-manifest.json',
        },
      },
    }),
  ],
});
