import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';
import federationOptions from './browser-module-federation.config';

export default defineConfig({
  browser: {
    enabled: true,
    provider: 'playwright',
    headless: true,
  },
  include: ['./tests/browser/*.test.tsx'],
  testTimeout: 30_000,
  plugins: [
    pluginReact(),
    pluginModuleFederation(federationOptions, {
      environment: 'rstest',
      target: 'web',
    }),
    federation(undefined, { target: 'browser' }),
  ],
});
