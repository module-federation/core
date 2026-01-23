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
  projects: [
    defineProject({
      name: 'unit',
      testEnvironment: 'node',
      globals: true,
      include: [
        path.resolve(__dirname, 'test/**/*.test.ts'),
        path.resolve(__dirname, 'test/**/*.spec.ts'),
      ],
      exclude: {
        patterns: [
          path.resolve(__dirname, 'test/**/*.vitest.ts'),
          path.resolve(__dirname, 'test/**/*.basictest.js'),
          path.resolve(__dirname, 'test/**/*.embedruntime.js'),
        ],
      },
      setupFiles: [path.resolve(__dirname, 'test/setupTestFramework.js')],
      testTimeout: 30000,
    }),
    defineProject({
      name: 'config-cases',
      testEnvironment: 'node',
      globals: true,
      include: [path.resolve(__dirname, 'test/**/*.rstest.ts')],
      exclude: {
        patterns: [
          path.resolve(__dirname, 'test/**/*.vitest.ts'),
          path.resolve(__dirname, 'test/**/*.basictest.js'),
          path.resolve(__dirname, 'test/**/*.embedruntime.js'),
          // This file is a shared harness that runner entrypoints import.
          // Running it directly would add an extra warmup-only test file.
          path.resolve(__dirname, 'test/ConfigTestCases.rstest.ts'),
        ],
      },
      setupFiles: [path.resolve(__dirname, 'test/setupTestFramework.js')],
      testTimeout: 60000, // webpack 编译耗时较长
    }),
  ],
});
