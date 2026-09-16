import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import browserEsmFederationOptions from './module-federation-browser-esm.config';
import browserFederationOptions from './module-federation-browser.config';
import localFederationOptions from './module-federation.config';

export default defineConfig({
  mode: 'development',
  environments: {
    local: {
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        cleanDistPath: true,
        distPath: {
          root: 'dist/local',
        },
        target: 'node',
      },
    },
    browser: {
      dev: {
        assetPrefix: 'http://127.0.0.1:3302/browser/',
      },
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        assetPrefix: 'http://127.0.0.1:3302/browser/',
        cleanDistPath: true,
        distPath: {
          root: 'dist/browser',
        },
        filenameHash: false,
        target: 'web',
      },
    },
    browserEsm: {
      dev: {
        assetPrefix: 'http://127.0.0.1:3302/browser-esm/',
      },
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
      output: {
        assetPrefix: 'http://127.0.0.1:3302/browser-esm/',
        cleanDistPath: true,
        distPath: {
          root: 'dist/browser-esm',
        },
        filenameHash: false,
        module: true,
        target: 'web',
      },
    },
  },
  plugins: [
    pluginReact({ fastRefresh: false }),
    pluginModuleFederation(localFederationOptions, {
      environment: 'local',
      target: 'node',
    }),
    pluginModuleFederation(browserFederationOptions, {
      environment: 'browser',
      target: 'web',
    }),
    pluginModuleFederation(browserEsmFederationOptions, {
      environment: 'browserEsm',
      target: 'web',
    }),
  ],
});
