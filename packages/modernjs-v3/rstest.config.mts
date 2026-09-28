import { defineConfig } from '@rstest/core';
import { BridgeSSRPlugin } from './src/rspack';

export default defineConfig({
  testEnvironment: 'node',
  // Exercise the published Bridge entries with the same target selection used
  // by a Modern Node build, including registration before a lazy loader settles.
  output: {
    bundleDependencies: ['@module-federation/bridge-react'],
  },
  tools: {
    rspack: {
      plugins: [new BridgeSSRPlugin()],
    },
  },
  include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  reporters: ['default'],
  passWithNoTests: true,
});
