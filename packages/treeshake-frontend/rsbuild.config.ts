import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  server: {
    base: '/tree-shaking',
    port: 3001,
  },
  html: {
    title: 'Tree Shaking Visualizer',
  },
  source: {
    entry: { index: './src/main.tsx' },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        process.env.VITE_API_BASE_URL,
      ),
      'process.env.VITE_API_BASE_URL': JSON.stringify(
        process.env.VITE_API_BASE_URL,
      ),
    },
  },
  dev: {
    assetPrefix: '/tree-shaking',
  },
  output: {
    distPath: {
      root: 'dist',
    },
    assetPrefix: '/tree-shaking/',
  },
  tools: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  plugins: [pluginReact()],
});
