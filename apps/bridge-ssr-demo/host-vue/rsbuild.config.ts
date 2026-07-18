import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import {
  bridgeSsrHostUrl,
  bridgeSsrRemotePort,
  bridgeSsrServerManifestPath,
} from '../shared/devHost';

const reactOrigin = bridgeSsrHostUrl(bridgeSsrRemotePort('react'));
const webRemotes = {
  bridge_ssr_react: `bridge_ssr_react@${reactOrigin}/mf-manifest.json`,
};
const ssrRemotes = {
  bridge_ssr_react: `bridge_ssr_react@${reactOrigin}/${bridgeSsrServerManifestPath}`,
};
const shared = {
  vue: { singleton: true, eager: true },
  'vue-router': { singleton: true, eager: true },
  react: { singleton: true, eager: true },
  'react-dom': { singleton: true, eager: true },
};

export default defineConfig({
  performance: { buildCache: false },
  server: { port: 2303, cors: true, middlewareMode: true },
  environments: {
    client: {
      source: { entry: { index: './src/entry.client.ts' } },
      html: { template: './src/index.html' },
      output: { distPath: { root: 'dist' } },
    },
    ssr: {
      source: { entry: { index: './src/entry.server.ts' } },
      output: { target: 'node', distPath: { root: 'dist/ssr' } },
    },
  },
  plugins: [
    pluginVue(),
    pluginModuleFederation(
      { name: 'bridge_ssr_vue_host', remotes: webRemotes, shared },
      { environment: 'client' },
    ),
    pluginModuleFederation(
      { name: 'bridge_ssr_vue_host', remotes: ssrRemotes, shared },
      { target: 'node', environment: 'ssr' },
    ),
  ],
});
