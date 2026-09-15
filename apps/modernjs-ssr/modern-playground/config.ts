import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';
import path from 'node:path';
export function config(app: string) {
  const provider = app.startsWith('remote');
  const consoleApp = app === 'console';
  const asset =
    process.env.SSR_CACHE_ASSET_URL + (app === 'remote-b' ? '/palette' : '');
  const modules = path.join(
    process.env.SSR_CACHE_PACKAGES_ROOT!,
    'node_modules',
  );
  return defineConfig({
    // The tested preview cannot safely initialize these MPA entries with shared server chunks.
    tools: {
      rspack(config, { isServer }) {
        if (isServer) config.optimization.splitChunks = false;
      },
    },
    output: {
      disableTsChecker: true,
      ...(provider ? { assetPrefix: asset + '/v1/' } : {}),
    },
    source: {
      ...(!provider && !consoleApp
        ? {
            disableDefaultEntries: true,
            entries: { index: 'src/routes', b: 'src/b' },
          }
        : {}),
      alias: {
        react: path.join(modules, 'react'),
        'react-dom': path.join(modules, 'react-dom'),
      },
    },
    server: { ssr: { mode: 'stream' } },
    plugins: [
      appTools(),
      ...(!consoleApp
        ? [
            moduleFederationPlugin({
              ssr: { cacheUpdates: true },
              config: {
                name: provider
                  ? app === 'remote-b'
                    ? 'lab_palette'
                    : 'r6_remote'
                  : 'lab_' + app,
                dts: false,
                ...(provider
                  ? {
                      filename: 'remoteEntry.js',
                      exposes: {
                        './Counter': './src/Counter.tsx',
                        './Palette': './src/Palette.tsx',
                      },
                    }
                  : {
                      remotes: {
                        remote: 'r6_remote@' + asset + '/v1/mf-manifest.json',
                      },
                    }),
                shared: {
                  react: { singleton: true },
                  'react-dom': { singleton: true },
                },
              },
            }),
          ]
        : []),
    ],
  });
}
