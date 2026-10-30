import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [vue(), vueJsx()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'bridge-shared',
      formats: ['es', 'umd', 'cjs'],
      fileName: (format) =>
        format === 'cjs' ? 'router.cjs' : `index.${format}.js`,
    },
  },
});
