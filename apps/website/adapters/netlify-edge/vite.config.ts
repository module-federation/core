// import { netlifyEdgeAdapter } from '@builder.io/qwik-city/adapters/netlify-edge/vite';
// import { extendConfig } from '@builder.io/qwik-city/vite';
// import baseConfig from '../../vite.config';

// export default extendConfig(baseConfig, () => {
//   return {
//     build: {
//       ssr: true,
//       rollupOptions: {
//         input: ['apps/website/src/entry.netlify-edge.tsx', '@qwik-city-plan'],
//       },
//       outDir: 'dist/apps/website/edge-functions/entry.netlify-edge',
//     },
//     plugins: [netlifyEdgeAdapter()],
//   };
// });

import { netlifyEdgeAdapter } from '@builder.io/qwik-city/adapters/netlify-edge/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { UserConfig, Plugin } from 'vite';
import { join } from 'path';
import baseConfig from '../../vite.config';

const modified: UserConfig = {
  ...baseConfig,
  // vite does not override plugins in it's "mergeConfig" util
  plugins: (baseConfig as UserConfig).plugins?.filter(
    (p) => (p as Plugin)?.name !== 'vite-plugin-qwik'
  ),
};
export default extendConfig(modified, () => {
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
        ssr: {
          outDir: join('../../', outDir),
        },
      }),
    ],
  };
});