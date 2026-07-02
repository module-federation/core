import { defineConfig } from 'vite';
import path from 'path';
import dts from 'vite-plugin-dts';
import packageJson from './package.json';

const perDepsKeys = Object.keys(packageJson.peerDependencies);

export default defineConfig({
  plugins: [
    // 添加我们的自定义插件
    dts({
      rollupTypes: true,
      bundledPackages: [
        '@module-federation/bridge-shared',
        'react-error-boundary',
      ],
      afterDiagnostic(diagnostics) {
        if (diagnostics.length > 0) {
          throw new Error(
            `Declaration generation failed with ${diagnostics.length} TypeScript diagnostic(s).`,
          );
        }
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        base: path.resolve(__dirname, 'src/base.ts'),
        plugin: path.resolve(__dirname, 'src/provider/plugin.ts'),
        router: path.resolve(__dirname, 'src/router/default.tsx'),
        'router-runtime': path.resolve(
          __dirname,
          'src/remote/router-component/router-runtime.ts',
        ),
        'router-v5': path.resolve(__dirname, 'src/router/v5.tsx'),
        'router-v6': path.resolve(__dirname, 'src/router/v6.tsx'),
        'router-v7': path.resolve(__dirname, 'src/router/v7.tsx'),
        'router-v8': path.resolve(__dirname, 'src/router/v8.tsx'),
        'router-v8-dom': path.resolve(__dirname, 'src/router/v8-dom.tsx'),
        v18: path.resolve(__dirname, 'src/v18.ts'),
        v19: path.resolve(__dirname, 'src/v19.ts'),
        'lazy-load-component-plugin': path.resolve(
          __dirname,
          'src/plugins/lazy-load-component-plugin.ts',
        ),
        'data-fetch-server-middleware': path.resolve(
          __dirname,
          'src/lazy/data-fetch/data-fetch-server-middleware.ts',
        ),
        'lazy-utils': path.resolve(__dirname, 'src/lazy/utils.ts'),
        'data-fetch-utils': path.resolve(
          __dirname,
          'src/lazy/data-fetch/index.ts',
        ),
        'data-fetch': path.resolve(__dirname, 'src/data-fetch.ts'),
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        ...perDepsKeys,
        '@module-federation/bridge-react/router-runtime',
        '@remix-run/router',
        /react-dom\/.*/,
        'react-router',
        'react-router/',
        'react-router/index.js',
        'react-router/dist/index.js',
        'react-router/dist/development/index.js',
        'react-router/dist/production/index.js',
        'react-router/dist/development/dom-export.js',
        'react-router/dist/production/dom-export.js',
        'react-router/dom',
        /^react-router\/.*/,
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

              if (
                (fileName.includes('router-v7') ||
                  fileName.includes('router-v8')) &&
                chunk.type === 'chunk'
              ) {
                // Replace react-router imports with dist keys that the bridge plugin
                // maps back to the user's installed router package, avoiding an alias loop.
                const isProduction = process.env.NODE_ENV === 'production';
                const distPath = isProduction
                  ? 'react-router/dist/production/index.js'
                  : 'react-router/dist/development/index.js';
                const domDistPath = isProduction
                  ? 'react-router/dist/production/dom-export.js'
                  : 'react-router/dist/development/dom-export.js';

                chunk.code = chunk.code.replace(
                  /from\s+['"`]react-router['"`]/g,
                  `from '${distPath}'`,
                );
                chunk.code = chunk.code.replace(
                  /require\((['"`])react-router\1\)/g,
                  `require('${distPath}')`,
                );
                chunk.code = chunk.code.replace(
                  /from\s+['"`]react-router\/dom['"`]/g,
                  `from '${domDistPath}'`,
                );
                chunk.code = chunk.code.replace(
                  /require\((['"`])react-router\/dom\1\)/g,
                  `require('${domDistPath}')`,
                );
                chunk.code = chunk.code.replace(
                  /(['"`])react-router\/dist\/development\/dom-export\.js\1/g,
                  `'${domDistPath}'`,
                );
                chunk.code = chunk.code.replace(
                  /export\s+\*\s+from\s+['"`]react-router['"`]/g,
                  `export * from '${distPath}'`,
                );
                chunk.code = chunk.code.replace(
                  /export\s+\*\s+from\s+['"`]react-router\/dom['"`]/g,
                  `export * from '${domDistPath}'`,
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
