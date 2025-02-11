import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';
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
        plugin: path.resolve(__dirname, 'src/core/plugin.ts'),
        router: path.resolve(__dirname, 'src/router/base.tsx'),
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
        'react-router-dom',
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
              if (chunk.type === 'chunk') {
                // 处理 v6 路由
                if (fileName.includes('router-v6')) {
                  chunk.code = chunk.code
                    .replace(
                      /['"]react-router-dom['"]/g,
                      "'react-router-dom/dist/index.js'",
                    )
                    .replace(
                      /['"]react-router['"]/g,
                      "'react-router/dist/index.js'",
                    );
                }
                // 处理 v5 路由
                if (fileName.includes('router-v5')) {
                  chunk.code = chunk.code
                    .replace(
                      /['"]react-router-dom['"]/g,
                      "'react-router-dom/index.js'",
                    )
                    .replace(
                      /['"]react-router['"]/g,
                      "'react-router/index.js'",
                    );
                }
                // 处理基础路由
                if (
                  fileName.includes('router.') &&
                  !fileName.includes('router-')
                ) {
                  chunk.code = chunk.code
                    .replace(/['"]react-router-dom['"]/g, "'react-router-dom'")
                    .replace(/['"]react-router['"]/g, "'react-router'");
                }
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
