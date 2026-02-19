import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  server: {
    port: 3025,
    host: '127.0.0.1',
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'rstest_rsbuild_host',
      remotes: {
        rstest_remote: 'rstest_remote@http://127.0.0.1:3016/remoteEntry.js',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
      },
    }),
  ],
});
