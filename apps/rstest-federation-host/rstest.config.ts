import path from 'node:path';
import { federation } from '@module-federation/rstest';
import { defineConfig } from '@rstest/core';
import federationOptions from './module-federation.config';

const appDirectory = import.meta.dirname;

export default defineConfig({
  include: [path.resolve(appDirectory, 'tests/*.test.ts')],
  testEnvironment: 'node',
  testTimeout: 30_000,
  plugins: [federation(federationOptions)],
});
