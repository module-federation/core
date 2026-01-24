import { defineConfig } from '@rstest/core';
import path from 'path';

export default defineConfig({
  testEnvironment: 'node',
  globals: true,
  include: [path.resolve(__dirname, 'test/ConfigTestCases.*.rstest.ts')],
  testTimeout: 60000, // webpack 编译耗时较长
});
