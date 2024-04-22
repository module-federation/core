import { moduleTools, defineConfig } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset: 'npm-component',
  buildConfig: {
    input: ['src/App.tsx'],
    tsconfig: 'tsconfig.lib.json',
  },
});
