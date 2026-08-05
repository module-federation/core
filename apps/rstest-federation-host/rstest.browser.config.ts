import path from 'node:path';
import { pluginReact } from '@rsbuild/plugin-react';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';
import federationOptions from './browser-module-federation.config';

const appDirectory = import.meta.dirname;

export default defineConfig({
  browser: {
    enabled: true,
    provider: 'playwright',
    headless: true,
  },
  globalSetup: [path.resolve(appDirectory, 'http-global-setup.ts')],
  include: [path.resolve(appDirectory, 'tests/browser/*.test.tsx')],
  testTimeout: 30_000,
  plugins: [pluginReact(), federation(federationOptions)],
});
