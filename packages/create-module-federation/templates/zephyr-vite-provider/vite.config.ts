import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { withZephyr } from 'vite-plugin-zephyr';
import mfConfig from './module-federation.config';

export default defineConfig({
  plugins: [react(), withZephyr({ mfConfig })],
  experimental: {
    renderBuiltUrl() {
      return { relative: true };
    },
  },
  server: {
    port: 3004,
  },
  build: {
    target: 'chrome89',
  },
});
