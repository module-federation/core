import { defineConfig } from '@rstest/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  root: import.meta.dirname,
  include: ['src/*.test.tsx'],
  browser: { enabled: true, provider: 'playwright', headless: true },
  plugins: [pluginReact()],
});
