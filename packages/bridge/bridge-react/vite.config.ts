import { defineConfig } from 'vite';
// import vue from '@vitejs/plugin-vue';
import path from 'path';
import dts from 'vite-plugin-dts';
// import react from '@vitejs/plugin-react';
import packageJson from './package.json';

const perDepsKeys = Object.keys(packageJson.peerDependencies);

export default defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      bundledPackages: [
        '@module-federation/bridge-shared',
        'react-error-boundary',
      ],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        plugin: path.resolve(__dirname, 'src/provider/plugin.ts'),
        router: path.resolve(__dirname, 'src/router/default.tsx'),
        'router-v5': path.resolve(__dirname, 'src/router/v5.tsx'),
        'router-v6': path.resolve(__dirname, 'src/router/v6.tsx'),
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        ...perDepsKeys,
        '@remix-run/router',
        /react-dom\/.*/,
        'react-router',
        'react-router-dom/',
        'react-router-dom/index.js',
        'react-router-dom/dist/index.js',
      ],
      plugins: [
        {
          name: 'modify-output-plugin',
          generateBundle(options, bundle) {
            for (const fileName in bundle) {
              const chunk = bundle[fileName];
              if (fileName.includes('router-v6') && chunk.type === 'chunk') {
                chunk.code = chunk.code.replace(
                  // Match 'react-router-dom/' followed by single quotes, double quotes, or backticks, replacing only 'react-router-dom/' to react-router-v6 dist file structure
                  /react-router-dom\/(?=[\'\"\`])/g,
                  'react-router-dom/dist/index.js',
                );
              }

              if (fileName.includes('router-v5') && chunk.type === 'chunk') {
                chunk.code = chunk.code.replace(
                  // Match 'react-router-dom/' followed by single quotes, double quotes, or backticks, replacing only 'react-router-dom/' to react-router-v5 dist file structure
                  /react-router-dom\/(?=[\'\"\`])/g,
                  'react-router-dom/index.js',
                );
              }
            }
          },
        },
      ],
    },
    minify: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
