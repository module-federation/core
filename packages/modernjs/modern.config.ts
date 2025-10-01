import { moduleTools, defineConfig } from '@modern-js/module-tools';

export default defineConfig({
  buildPreset: 'modern-js-universal',
  buildConfig: {
    dts: false,
  },
  plugins: [moduleTools()],
});
