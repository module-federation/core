import { defineConfig } from 'vite';
import path from 'path';
import packageJson from './package.json';

const peerDepsKeys = Object.keys(packageJson.peerDependencies ?? {});
const dependencyKeys = Object.keys(packageJson.dependencies ?? {});

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        'data-fetch-utils': path.resolve(__dirname, 'src/data-fetch-utils.ts'),
        'server-middleware': path.resolve(
          __dirname,
          'src/data-fetch-server-middleware.ts',
        ),
        utils: path.resolve(__dirname, 'src/utils.ts'),
        'size-limited-cache': path.resolve(
          __dirname,
          'src/size-limited-cache.ts',
        ),
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        ...peerDepsKeys,
        ...dependencyKeys,
        '@module-federation/runtime/helpers',
      ],
    },
    minify: false,
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
});
