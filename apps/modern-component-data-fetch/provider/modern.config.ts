import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 5002,
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
