import { defineConfig } from '@rstest/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginVueJsx } from '@rsbuild/plugin-vue-jsx';
import { resolve } from 'path';

export default defineConfig({
  source: {
    define: {
      __APP_VERSION__: '"unknown"',
    },
  },
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginVueJsx(),
  ],
  testEnvironment: 'jsdom',
  globals: true,
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
