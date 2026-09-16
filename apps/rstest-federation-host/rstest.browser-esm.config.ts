import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { pluginReact } from '@rsbuild/plugin-react';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';
import federationOptions from './browser-esm-module-federation.config';

export default defineConfig({
  browser: {
    enabled: true,
    provider: 'playwright',
    headless: true,
  },
  include: ['./tests/browser-esm/*.test.tsx'],
  testTimeout: 30_000,
  plugins: [
    pluginReact(),
    pluginModuleFederation(federationOptions, {
      environment: 'rstest',
      target: 'web',
    }),
    federation(),
  ],
});
