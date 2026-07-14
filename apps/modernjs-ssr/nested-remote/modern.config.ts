import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

const typeCheckerTypeScriptPath = require.resolve('typescript-compiler');

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3052,
  },
  tools: {
    tsChecker: {
      typescript: {
        typescriptPath: typeCheckerTypeScriptPath,
      },
    },
  },
  plugins: [appTools(), moduleFederationPlugin()],
});
