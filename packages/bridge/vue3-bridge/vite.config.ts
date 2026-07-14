import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import vueJsx from '@vitejs/plugin-vue-jsx';
import packageJson from './package.json';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
