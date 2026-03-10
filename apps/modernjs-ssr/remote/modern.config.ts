import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  output: {
    assetPrefix: 'http://localhost:3051',
  },

  plugins: [appTools(), moduleFederationPlugin()],
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3051,
  },
});
