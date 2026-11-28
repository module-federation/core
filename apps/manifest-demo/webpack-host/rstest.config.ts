import path from 'node:path';
import { defineConfig } from '@rstest/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { federation } from '@module-federation/rstest';
import options from './module-federation.config.cjs';

export default defineConfig({
  root: import.meta.dirname,
  include: ['tests/*.test.tsx'],
  globalSetup: ['./tests/remotes.ts'],
  browser: { enabled: true, provider: 'playwright', headless: true },
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
        ...options,
        runtime: undefined,
        dts: false,
        shared: {
          ...options.shared,
          react: { singleton: true, eager: true },
          'react-dom': { singleton: true, eager: true },
        },
      },
      { environment: 'rstest', target: 'web' },
    ),
    federation(),
  ],
});
