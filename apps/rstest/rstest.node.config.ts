import path from 'node:path';
import { federation } from '@module-federation/rstest-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';

export default defineConfig({
  name: 'node',
  testEnvironment: 'node',
  globalSetup: ['./scripts/rstestNodeGlobalSetup.ts'],
  setupFiles: ['./scripts/rstest.setup.ts'],
  include: ['test/node/**/*.test.{ts,tsx}'],
  plugins: [
    pluginReact(),
    federation({
      name: 'rstest_host',
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
