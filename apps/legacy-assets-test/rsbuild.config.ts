import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginCheckSyntax } from '@rsbuild/plugin-check-syntax';

export default defineConfig({
  plugins: [pluginReact(), pluginCheckSyntax()],
  source: {
    include: [/module-federation/],
  },
});
