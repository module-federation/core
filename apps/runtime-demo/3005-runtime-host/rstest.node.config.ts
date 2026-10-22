import { defineConfig } from '@rstest/core';

export default defineConfig({
  root: import.meta.dirname,
  include: ['tests/*.test.ts'],
});
