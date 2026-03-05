import path from 'node:path';
import { federation } from '@module-federation/rstest-plugin';
import { withRslibConfig } from '@rstest/adapter-rslib';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  extends: withRslibConfig({ cwd: __dirname, libId: 'node' }),
  name: 'rslib-node',
  testEnvironment: 'node',
  globalSetup: ['./scripts/rstestNodeGlobalSetup.ts'],
  setupFiles: ['./scripts/rstest.setup.ts'],
  include: ['test/node/**/*.test.{ts,tsx}'],
  plugins: [
    federation({
      name: 'rstest_rslib_host',
      remoteType: 'commonjs',
      remotes: {
        rstest_remote: `commonjs ${path.resolve(
          __dirname,
          '../rstest-remote/dist-node/remoteEntry.js',
        )}`,
      },
      shared: {
        react: { singleton: true, eager: true },
        'react-dom': { singleton: true, eager: true },
      },
    }),
  ],
  federation: true,
  testTimeout: 15_000,
});
