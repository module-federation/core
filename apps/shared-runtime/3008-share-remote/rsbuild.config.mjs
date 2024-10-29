import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { ModuleFederationPlugin } from '@module-federation/enhanced/rspack';

export default defineConfig({
  server: {
    port: 3008,
  },
  dev: {
    // It is necessary to configure assetPrefix, and in the production environment, you need to configure output.assetPrefix
    assetPrefix: 'http://localhost:3008',
  },
  tools: {
    rspack: (config, { appendPlugins }) => {
      config.output.uniqueName = 'runtime_remote3';
      appendPlugins([
        new ModuleFederationPlugin({
          name: 'runtime_remote3',
          exposes: {
            './button': './src/Button.tsx',
          },
          shared: ['react', 'react-dom'],
        }),
      ]);
    },
  },
  plugins: [pluginReact()],
});
