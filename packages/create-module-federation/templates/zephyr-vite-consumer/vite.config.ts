import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { withZephyr } from 'vite-plugin-zephyr';
import mfConfig from './module-federation.config';

export default defineConfig({
  plugins: [react(), withZephyr({ mfConfig })],
  server: {
    port: 3005,
  },
  build: {
    target: 'chrome89',
  },
});
