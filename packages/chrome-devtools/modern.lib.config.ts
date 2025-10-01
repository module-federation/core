import { moduleTools, defineConfig } from '@modern-js/module-tools';

export default defineConfig({
  plugins: [moduleTools()],
  buildPreset: ({ preset }) =>
    preset['npm-component'].map((config, index) => {
      const nextConfig = {
        ...config,
        input: ['src', '!src/index.tsx'],
        tsconfig: 'tsconfig.lib.json',
      };

      if (index === 2 && nextConfig.dts) {
        nextConfig.dts = {
          ...nextConfig.dts,
          tsconfigPath: 'tsconfig.dts.json',
          enableTscBuild: true,
        };
      }

      return nextConfig;
    }),
});
