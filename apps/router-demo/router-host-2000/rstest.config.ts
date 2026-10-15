import path from 'node:path';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { federation } from '@module-federation/rstest';
import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rstest/core';
import federationOptions from './module-federation.config';

export default defineConfig({
  root: import.meta.dirname,
  globalSetup: ['./tests/remote-servers.ts'],
  include: ['./tests/*.test.tsx'],
  browser: {
    enabled: true,
    provider: 'playwright',
    headless: true,
  },
  testTimeout: 30_000,
  resolve: {
    alias: {
      react: path.join(import.meta.dirname, 'node_modules/react'),
      'react-dom': path.join(import.meta.dirname, 'node_modules/react-dom'),
    },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation(
      {
        ...federationOptions,
        shared: {
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
        },
        dts: false,
      },
      { environment: 'rstest', target: 'web' },
    ),
    federation(),
  ],
});
