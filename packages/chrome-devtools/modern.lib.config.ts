import { moduleTools, defineConfig } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset: 'npm-component',
  buildConfig: {
    dts: false,
    input: ['src', '!src/index.tsx'],
    tsconfig: 'tsconfig.lib.json',
  },
});
