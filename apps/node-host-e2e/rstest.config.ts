import path from 'node:path';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';
import { localRemoteEntryPath, remoteEntryUrl } from './remotes';

export default defineConfig({
  root: import.meta.dirname,
  globalSetup: [path.resolve(import.meta.dirname, 'remotes.ts')],
  include: ['src/**/*.test.ts'],
  testEnvironment: 'node',
  testTimeout: 30_000,
  plugins: [
    federation({
      name: 'node_host',
      remotes: {
        node_local_remote: `commonjs ${localRemoteEntryPath}`,
        node_remote: `node_remote@${remoteEntryUrl('node_remote')}`,
      },
    }),
  ],
});
