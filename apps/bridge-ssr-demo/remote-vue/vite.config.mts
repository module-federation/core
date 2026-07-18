import { federation } from '@module-federation/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'node:path';
import { bridgeSsrHostUrl } from '../shared/devHost';

const isSSR = process.env.BRIDGE_VITE_SSR === 'true';
const remoteOrigin = bridgeSsrHostUrl(2402);

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'bridge_ssr_vue',
      filename: 'remoteEntry.js',
      exposes: {
        './export-app': isSSR
          ? './src/export-app.server.ts'
          : './src/export-app.ts',
      },
      shared: isSSR
        ? {}
        : {
            vue: { singleton: true },
            'vue-router': { singleton: true },
          },
      manifest: true,
      dts: false,
      target: isSSR ? 'node' : 'web',
      getPublicPath: `return '${remoteOrigin}${isSSR ? '/ssr' : ''}/'`,
    }),
  ],
  server: {
    origin: remoteOrigin,
    port: 2402,
  },
  build: {
    outDir: isSSR ? 'dist-vite/ssr' : 'dist-vite',
    emptyOutDir: !isSSR,
    target: isSSR ? 'node20' : 'es2020',
    ssr: isSSR ? './src/ssr-env.ts' : undefined,
    rollupOptions: isSSR
      ? undefined
      : {
          input: path.resolve(__dirname, 'src/standalone.ts'),
        },
  },
  ssr: {
    noExternal: true,
  },
});
