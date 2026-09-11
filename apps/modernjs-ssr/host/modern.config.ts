import { appTools, defineConfig } from '@modern-js/app-tools';
import { moduleFederationPlugin } from '@module-federation/modern-js-v3';

const typeCheckerTypeScriptPath = require.resolve('typescript-compiler');

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  // Keep the cross-request cache probes in one SSR module generation. A first
  // browser visit must not trigger lazy compilation and reset their state.
  dev: {
    lazyCompilation: false,
  },
  server: {
    ssr: {
      mode: 'stream',
    },
    port: 3050,
  },
  output: {
    disableTsChecker: process.env.MF_SSR_GC_PROBE === 'true',
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
