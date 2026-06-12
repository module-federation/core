import path from 'node:path';
import { federation } from '@module-federation/rstest';
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
  // Requires rstest's federation support (web-infra-dev/rstest#1407). This
  // demo installs the pkg.pr.new canary of @rstest/core from that PR; the
  // flag is ignored by released @rstest/core versions (<= 0.10.x).
  federation: true,
  testTimeout: 15_000,
});
