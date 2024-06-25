import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import dts from 'vite-plugin-dts';
import vueJsx from '@vitejs/plugin-vue-jsx';
import packageJson from './package.json';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      bundledPackages: ['@module-federation/bridge-shared'],
    }),
    vueJsx(),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
