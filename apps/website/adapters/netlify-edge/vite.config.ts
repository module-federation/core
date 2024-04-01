import { netlifyEdgeAdapter } from '@builder.io/qwik-city/adapters/netlify-edge/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { UserConfig, Plugin, UserConfigExport } from 'vite';
import { join } from 'path';
import baseConfig from '../../vite.config';

const modified: UserConfig = {
  ...baseConfig,
  // vite does not override plugins in it's "mergeConfig" util
  plugins: (baseConfig as UserConfig).plugins?.filter(
    (p) => (p as Plugin)?.name !== 'vite-plugin-qwik',
  ),
};
export default extendConfig(modified as UserConfigExport, () => {
  const outDir = 'dist/apps/website/.netlify/edge-functions/entry.netlify-edge';
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ['apps/website/src/entry.netlify-edge.tsx', '@qwik-city-plan'],
      },
      outDir: 'dist/apps/website/.netlify/edge-functions/entry.netlify-edge',
    },
    plugins: [
      netlifyEdgeAdapter(),
      qwikVite({
        client: {
          outDir: '../../dist/apps/website/client',
        },
        ssr: {
          outDir: join('../../', outDir),
        },
      }),
    ],
  };
});
