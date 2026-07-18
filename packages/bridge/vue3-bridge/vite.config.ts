import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import vueJsx from '@vitejs/plugin-vue-jsx';
import packageJson from './package.json';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        'index.server': path.resolve(__dirname, 'src/index.server.ts'),
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) =>
        entryName === 'index'
          ? format === 'es'
            ? 'index.js'
            : 'index.cjs'
          : format === 'es'
            ? `${entryName}.js`
            : `${entryName}.cjs`,
    },
    rollupOptions: {
      external: ['vue', 'vue-router', '@vue/server-renderer'],
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
