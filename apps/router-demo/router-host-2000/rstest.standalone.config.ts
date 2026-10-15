import { defineConfig } from '@rstest/core';

export default defineConfig({
  root: import.meta.dirname,
  globalSetup: ['./tests/remote-servers.ts'],
  include: ['./tests/standalone.rstest.ts'],
  testEnvironment: 'node',
  testTimeout: 30_000,
});
