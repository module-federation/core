import { defineConfig, defineProject } from '@rstest/core';
import path from 'path';

export default defineConfig({
  testEnvironment: 'node',
  output: {
    module: false, // Output in CommonJS format to ensure `require` is available
    // Externalize webpack to avoid conflicts with nested webpack builds in ConfigTestCases
    externals: [
      'webpack',
      /^webpack\//,
      '@module-federation/enhanced',
      /^@module-federation\//,
    ],
  },
  // Run in a single worker to avoid filesystem races in treeshake config cases.
  pool: {
    type: 'forks',
    maxWorkers: 1,
    minWorkers: 1,
  },
  projects: [
    defineProject({
      name: 'config-cases-treeshake-serial',
      testEnvironment: 'node',
      globals: true,
      include: [
        path.resolve(__dirname, 'test/ConfigTestCases.treeshake.rstest.ts'),
      ],
      setupFiles: [path.resolve(__dirname, 'test/setupTestFramework.js')],
      testTimeout: 60000,
    }),
  ],
});

