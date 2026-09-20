import path from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';

const fixtureDirectory = import.meta.dirname;

export default defineConfig({
  globalSetup: [path.resolve(fixtureDirectory, 'remote/build-remote.ts')],
  include: [path.resolve(fixtureDirectory, '*.test.ts')],
  testEnvironment: 'node',
  testTimeout: 30_000,
  plugins: [
    pluginModuleFederation(
      {
        name: 'rstest_integration_host',
        remotes: {
          'fixture-remote': `commonjs ${path.resolve(
            fixtureDirectory,
            'remote/dist/remoteEntry.cjs',
          )}`,
        },
      },
      {
        environment: 'rstest',
        target: 'node',
      },
    ),
    federation(),
  ],
});
