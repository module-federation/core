import { appTools, defineConfig } from '@modern-js/app-tools';

export default defineConfig({
  server: { port: 3059, ssr: { mode: 'stream' } },
  output: { disableTsChecker: true },
  plugins: [appTools()],
});
