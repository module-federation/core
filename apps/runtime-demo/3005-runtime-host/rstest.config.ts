import express from 'express';
import registerFixtures from './fixtures.cjs';
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
  browser: {
    enabled: true,
    provider: 'playwright',
    headless: true,
    port: 3005,
    strictPort: true,
  },
  testTimeout: 30_000,
  resolve: {
    alias: {
      react: path.join(import.meta.dirname, 'node_modules/react'),
      'react-dom': path.join(import.meta.dirname, 'node_modules/react-dom'),
    },
  },
  plugins: [
    {
      name: 'runtime-fixtures',
      setup(api) {
        api.modifyRsbuildConfig((config) => {
          config.source ??= {};
          config.source.preEntry = [
            path.join(
              import.meta.dirname,
              '../../../tools/rstest/expected-errors.ts',
            ),
          ];
          config.server = { ...config.server, port: 3005, host: '127.0.0.1' };
          config.dev ??= {};
          config.dev.setupMiddlewares = [
            (middlewares) => {
              const app = express();
              app.use((_req, res, next) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
                next();
              });
              registerFixtures(app);
              middlewares.unshift(app);
            },
          ];
        });
      },
    },
    pluginReact(),
    pluginModuleFederation(
      {
        ...options,
        runtimePlugins: [
          ...options.runtimePlugins,
          path.join(import.meta.dirname, 'tests/crossorigin.ts'),
        ],

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
