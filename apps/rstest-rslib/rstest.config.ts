import { defineConfig } from '@rstest/core';

export default defineConfig({
  projects: ['./rstest.node.config.ts', './rstest.browser.config.ts'],
});
