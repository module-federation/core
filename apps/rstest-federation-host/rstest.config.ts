import path from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';
import federationOptions from './module-federation.config';

const appDirectory = import.meta.dirname;

export default defineConfig({
  globalSetup: [path.resolve(appDirectory, 'remote-servers.mjs')],
  include: [
    path.resolve(appDirectory, 'tests/*.test.ts'),
    path.resolve(appDirectory, 'tests/*.test.tsx'),
  ],
  testEnvironment: 'jsdom',
  testTimeout: 30_000,
  plugins: [
    pluginReact(),
    pluginModuleFederation(federationOptions, {
      environment: 'rstest',
      target: 'node',
    }),
    federation(),
  ],
});
