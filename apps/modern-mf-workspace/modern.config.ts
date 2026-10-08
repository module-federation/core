import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

export default defineConfig({
  server: {
    port: 4173,
    ssr: false,
  },
  dev: {
    server: {
      proxy: {
        '/api': 'http://127.0.0.1:4174',
        '/remotes': 'http://127.0.0.1:4174',
      },
    },
  },
  html: { title: 'MF Workspace · 分层应用实验室' },
  plugins: [appTools(), moduleFederationPlugin()],
});
