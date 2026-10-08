import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  server: { port: 3065, ssr: { mode: 'stream' } },
  output: {
    disableTsChecker: true,
    assetPrefix:
      (process.env.SSR_CACHE_ASSET_URL || 'http://127.0.0.1:3066') +
      '/palette/v2/',
  },
  plugins: [
    appTools(),
    moduleFederationPlugin({
      ssr: { cacheUpdates: true },
      config: {
        name: 'lab_palette',
        dts: false,
        shared: {
          react: { singleton: true },
          'react-dom': { singleton: true },
        },
        filename: 'remoteEntry.js',
        exposes: { './Weather': './src/Weather.tsx' },
      },
    }),
  ],
});
