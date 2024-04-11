import { appTools, defineConfig } from '@modern-js/app-tools';
import { ModuleFederationPlugin } from '@module-federation/enhanced';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  source: {
    define: {
      'process.env.DEBUG': false,
      'process.env.BYTEST': false,
    },
  },
  output: {
    disableInlineRuntimeChunk: true,
    disableFilenameHash: true,
    disableMinimize: true,
  },
  performance: {
    chunkSplit: {
      strategy: 'all-in-one',
    },
  },
  tools: {
    webpack: (config: Record<string, any>, { appendPlugins }) => {
      if (process.env.E2ETEST) {
        config.entry.worker = './src/worker/index.ts';
      }
      config.entry['fast-refresh-init'] =
        './src/utils/chrome/fast-refresh-init.ts';
      config.entry['fast-refresh'] = './src/utils/chrome/fast-refresh.ts';
      config.entry['snapshot-plugin-init'] =
        './src/utils/chrome/snapshot-plugin-init.ts';
      config.entry['snapshot-plugin'] = './src/utils/chrome/snapshot-plugin.ts';
      config.entry['post-message'] = './src/utils/chrome/post-message.ts';
      config.entry['post-message-init'] =
        './src/utils/chrome/post-message-init.ts';
      config.entry['post-message-listener'] =
        './src/utils/chrome/post-message-listener.ts';
      config.entry['post-message-start'] =
        './src/utils/chrome/post-message-start.ts';

      appendPlugins([
        new ModuleFederationPlugin({
          name: 'app1',
          exposes: {
            './App': './src/App.tsx',
          },
          shared: {
            react: { singleton: true },
            'react-dom': { singleton: true },
          },
        }),
      ]);

      return config;
    },
  },
  plugins: [appTools()],
});
