import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  server: {
    port: 3060,
    ssr: {
      mode: 'stream',
    },
    rsc: true,
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
