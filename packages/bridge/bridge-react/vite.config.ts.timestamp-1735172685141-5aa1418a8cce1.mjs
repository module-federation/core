// vite.config.ts
import { defineConfig } from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite@5.2.14_@types+node@18.16.9_less@4.2.0_stylus@0.64.0/node_modules/vite/dist/node/index.js';
import path from 'path';
import dts from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite-plugin-dts@4.3.0_@types+node@18.16.9_rollup@4.24.0_typescript@5.5.2_vite@5.2.14/node_modules/vite-plugin-dts/dist/index.mjs';

// package.json
var package_default = {
  name: '@module-federation/bridge-react',
  version: '0.8.3',
  publishConfig: {
    access: 'public',
  },
  author: 'zhouxiao <codingzx@gmail.com>',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/module-federation/core',
    directory: 'packages/bridge-react',
  },
  type: 'module',
  main: './dist/index.cjs.js',
  module: './dist/index.es.js',
  types: './dist/index.d.ts',
  exports: {
    '.': {
      types: './dist/index.d.ts',
      import: './dist/index.es.js',
      require: './dist/index.cjs.js',
    },
    './router': {
      types: './dist/router.d.ts',
      import: './dist/router.es.js',
      require: './dist/router.cjs.js',
    },
    './plugin': {
      types: './dist/plugin.d.ts',
      import: './dist/plugin.es.js',
      require: './dist/plugin.es.js',
    },
    './router-v5': {
      types: './dist/router-v5.d.ts',
      import: './dist/router-v5.es.js',
      require: './dist/router-v5.cjs.js',
    },
    './router-v6': {
      types: './dist/router-v6.d.ts',
      import: './dist/router-v6.es.js',
      require: './dist/router-v6.cjs.js',
    },
    './*': './*',
  },
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
  },
  dependencies: {
    '@loadable/component': '^5.16.4',
    '@module-federation/bridge-shared': 'workspace:*',
    '@module-federation/sdk': 'workspace:*',
    'react-error-boundary': '^4.0.13',
  },
  peerDependencies: {
    react: '>=16.9.0',
    'react-dom': '>=16.9.0',
    'react-router-dom': '^4 || ^5 || ^6',
  },
  devDependencies: {
    '@testing-library/react': '15.0.7',
    '@types/react': '18.2.79',
    '@types/react-dom': '18.3.0',
    '@vitejs/plugin-react': '^4.3.3',
    '@vitejs/plugin-vue': '^5.0.4',
    '@vitejs/plugin-vue-jsx': '^4.0.0',
    jsdom: '^24.1.0',
    react: '18.3.1',
    'react-dom': '18.3.1',
    'react-router-dom': '6.22.3',
    typescript: '^5.2.2',
    vite: '^5.2.14',
    'vite-plugin-dts': '^4.3.0',
    '@module-federation/runtime': 'workspace:*',
  },
};

// vite.config.ts
var __vite_injected_original_dirname =
  '/Users/bytedance/dev/universe/packages/bridge/bridge-react';
var perDepsKeys = Object.keys(package_default.peerDependencies);
var vite_config_default = defineConfig({
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
        index: path.resolve(__vite_injected_original_dirname, 'src/index.ts'),
        plugin: path.resolve(__vite_injected_original_dirname, 'src/plugin.ts'),
        router: path.resolve(
          __vite_injected_original_dirname,
          'src/router.tsx',
        ),
        'router-v5': path.resolve(
          __vite_injected_original_dirname,
          'src/router-v5.tsx',
        ),
        'router-v6': path.resolve(
          __vite_injected_original_dirname,
          'src/router-v6.tsx',
        ),
      },
      formats: ['cjs', 'es'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
    },
    rollupOptions: {
      external: [
        ...perDepsKeys,
        '@remix-run/router',
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
    __APP_VERSION__: JSON.stringify(package_default.version),
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYnl0ZWRhbmNlL2Rldi91bml2ZXJzZS9wYWNrYWdlcy9icmlkZ2UvYnJpZGdlLXJlYWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG4vLyBpbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcbi8vIGltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xuXG5jb25zdCBwZXJEZXBzS2V5cyA9IE9iamVjdC5rZXlzKHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgZHRzKHtcbiAgICAgIHJvbGx1cFR5cGVzOiB0cnVlLFxuICAgICAgYnVuZGxlZFBhY2thZ2VzOiBbXG4gICAgICAgICdAbW9kdWxlLWZlZGVyYXRpb24vYnJpZGdlLXNoYXJlZCcsXG4gICAgICAgICdyZWFjdC1lcnJvci1ib3VuZGFyeScsXG4gICAgICBdLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHtcbiAgICAgICAgaW5kZXg6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcbiAgICAgICAgcGx1Z2luOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3BsdWdpbi50cycpLFxuICAgICAgICByb3V0ZXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcm91dGVyLnRzeCcpLFxuICAgICAgICAncm91dGVyLXY1JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9yb3V0ZXItdjUudHN4JyksXG4gICAgICAgICdyb3V0ZXItdjYnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3JvdXRlci12Ni50c3gnKSxcbiAgICAgIH0sXG4gICAgICBmb3JtYXRzOiBbJ2NqcycsICdlcyddLFxuICAgICAgZmlsZU5hbWU6IChmb3JtYXQsIGVudHJ5TmFtZSkgPT4gYCR7ZW50cnlOYW1lfS4ke2Zvcm1hdH0uanNgLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFtcbiAgICAgICAgLi4ucGVyRGVwc0tleXMsXG4gICAgICAgICdAcmVtaXgtcnVuL3JvdXRlcicsXG4gICAgICAgICdyZWFjdC1yb3V0ZXInLFxuICAgICAgICAncmVhY3Qtcm91dGVyLWRvbS8nLFxuICAgICAgICAncmVhY3Qtcm91dGVyLWRvbS9pbmRleC5qcycsXG4gICAgICAgICdyZWFjdC1yb3V0ZXItZG9tL2Rpc3QvaW5kZXguanMnLFxuICAgICAgXSxcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG5hbWU6ICdtb2RpZnktb3V0cHV0LXBsdWdpbicsXG4gICAgICAgICAgZ2VuZXJhdGVCdW5kbGUob3B0aW9ucywgYnVuZGxlKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZpbGVOYW1lIGluIGJ1bmRsZSkge1xuICAgICAgICAgICAgICBjb25zdCBjaHVuayA9IGJ1bmRsZVtmaWxlTmFtZV07XG4gICAgICAgICAgICAgIGlmIChmaWxlTmFtZS5pbmNsdWRlcygncm91dGVyLXY2JykgJiYgY2h1bmsudHlwZSA9PT0gJ2NodW5rJykge1xuICAgICAgICAgICAgICAgIGNodW5rLmNvZGUgPSBjaHVuay5jb2RlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAvLyBNYXRjaCAncmVhY3Qtcm91dGVyLWRvbS8nIGZvbGxvd2VkIGJ5IHNpbmdsZSBxdW90ZXMsIGRvdWJsZSBxdW90ZXMsIG9yIGJhY2t0aWNrcywgcmVwbGFjaW5nIG9ubHkgJ3JlYWN0LXJvdXRlci1kb20vJyB0byByZWFjdC1yb3V0ZXItdjYgZGlzdCBmaWxlIHN0cnVjdHVyZVxuICAgICAgICAgICAgICAgICAgL3JlYWN0LXJvdXRlci1kb21cXC8oPz1bXFwnXFxcIlxcYF0pL2csXG4gICAgICAgICAgICAgICAgICAncmVhY3Qtcm91dGVyLWRvbS9kaXN0L2luZGV4LmpzJyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lLmluY2x1ZGVzKCdyb3V0ZXItdjUnKSAmJiBjaHVuay50eXBlID09PSAnY2h1bmsnKSB7XG4gICAgICAgICAgICAgICAgY2h1bmsuY29kZSA9IGNodW5rLmNvZGUucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgIC8vIE1hdGNoICdyZWFjdC1yb3V0ZXItZG9tLycgZm9sbG93ZWQgYnkgc2luZ2xlIHF1b3RlcywgZG91YmxlIHF1b3Rlcywgb3IgYmFja3RpY2tzLCByZXBsYWNpbmcgb25seSAncmVhY3Qtcm91dGVyLWRvbS8nIHRvIHJlYWN0LXJvdXRlci12NSBkaXN0IGZpbGUgc3RydWN0dXJlXG4gICAgICAgICAgICAgICAgICAvcmVhY3Qtcm91dGVyLWRvbVxcLyg/PVtcXCdcXFwiXFxgXSkvZyxcbiAgICAgICAgICAgICAgICAgICdyZWFjdC1yb3V0ZXItZG9tL2luZGV4LmpzJyxcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSxcbiAgICBtaW5pZnk6IGZhbHNlLFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHBhY2thZ2VKc29uLnZlcnNpb24pLFxuICB9LFxufSk7XG4iLCAie1xuICBcIm5hbWVcIjogXCJAbW9kdWxlLWZlZGVyYXRpb24vYnJpZGdlLXJlYWN0XCIsXG4gIFwidmVyc2lvblwiOiBcIjAuOC4zXCIsXG4gIFwicHVibGlzaENvbmZpZ1wiOiB7XG4gICAgXCJhY2Nlc3NcIjogXCJwdWJsaWNcIlxuICB9LFxuICBcImF1dGhvclwiOiBcInpob3V4aWFvIDxjb2Rpbmd6eEBnbWFpbC5jb20+XCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL21vZHVsZS1mZWRlcmF0aW9uL2NvcmVcIixcbiAgICBcImRpcmVjdG9yeVwiOiBcInBhY2thZ2VzL2JyaWRnZS1yZWFjdFwiXG4gIH0sXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcIm1haW5cIjogXCIuL2Rpc3QvaW5kZXguY2pzLmpzXCIsXG4gIFwibW9kdWxlXCI6IFwiLi9kaXN0L2luZGV4LmVzLmpzXCIsXG4gIFwidHlwZXNcIjogXCIuL2Rpc3QvaW5kZXguZC50c1wiLFxuICBcImV4cG9ydHNcIjoge1xuICAgIFwiLlwiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9kaXN0L2luZGV4LmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L2luZGV4LmVzLmpzXCIsXG4gICAgICBcInJlcXVpcmVcIjogXCIuL2Rpc3QvaW5kZXguY2pzLmpzXCJcbiAgICB9LFxuICAgIFwiLi9yb3V0ZXJcIjoge1xuICAgICAgXCJ0eXBlc1wiOiBcIi4vZGlzdC9yb3V0ZXIuZC50c1wiLFxuICAgICAgXCJpbXBvcnRcIjogXCIuL2Rpc3Qvcm91dGVyLmVzLmpzXCIsXG4gICAgICBcInJlcXVpcmVcIjogXCIuL2Rpc3Qvcm91dGVyLmNqcy5qc1wiXG4gICAgfSxcbiAgICBcIi4vcGx1Z2luXCI6IHtcbiAgICAgIFwidHlwZXNcIjogXCIuL2Rpc3QvcGx1Z2luLmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L3BsdWdpbi5lcy5qc1wiLFxuICAgICAgXCJyZXF1aXJlXCI6IFwiLi9kaXN0L3BsdWdpbi5lcy5qc1wiXG4gICAgfSxcbiAgICBcIi4vcm91dGVyLXY1XCI6IHtcbiAgICAgIFwidHlwZXNcIjogXCIuL2Rpc3Qvcm91dGVyLXY1LmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L3JvdXRlci12NS5lcy5qc1wiLFxuICAgICAgXCJyZXF1aXJlXCI6IFwiLi9kaXN0L3JvdXRlci12NS5janMuanNcIlxuICAgIH0sXG4gICAgXCIuL3JvdXRlci12NlwiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9kaXN0L3JvdXRlci12Ni5kLnRzXCIsXG4gICAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9yb3V0ZXItdjYuZXMuanNcIixcbiAgICAgIFwicmVxdWlyZVwiOiBcIi4vZGlzdC9yb3V0ZXItdjYuY2pzLmpzXCJcbiAgICB9LFxuICAgIFwiLi8qXCI6IFwiLi8qXCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImRldlwiOiBcInZpdGVcIixcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZFwiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBsb2FkYWJsZS9jb21wb25lbnRcIjogXCJeNS4xNi40XCIsXG4gICAgXCJAbW9kdWxlLWZlZGVyYXRpb24vYnJpZGdlLXNoYXJlZFwiOiBcIndvcmtzcGFjZToqXCIsXG4gICAgXCJAbW9kdWxlLWZlZGVyYXRpb24vc2RrXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcInJlYWN0LWVycm9yLWJvdW5kYXJ5XCI6IFwiXjQuMC4xM1wiXG4gIH0sXG4gIFwicGVlckRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJyZWFjdFwiOiBcIj49MTYuOS4wXCIsXG4gICAgXCJyZWFjdC1kb21cIjogXCI+PTE2LjkuMFwiLFxuICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiOiBcIl40IHx8IF41IHx8IF42XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHRlc3RpbmctbGlicmFyeS9yZWFjdFwiOiBcIjE1LjAuN1wiLFxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiMTguMi43OVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIjE4LjMuMFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjogXCJeNC4zLjNcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIl41LjAuNFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiOiBcIl40LjAuMFwiLFxuICAgIFwianNkb21cIjogXCJeMjQuMS4wXCIsXG4gICAgXCJyZWFjdFwiOiBcIjE4LjMuMVwiLFxuICAgIFwicmVhY3QtZG9tXCI6IFwiMTguMy4xXCIsXG4gICAgXCJyZWFjdC1yb3V0ZXItZG9tXCI6IFwiNi4yMi4zXCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjUuMi4yXCIsXG4gICAgXCJ2aXRlXCI6IFwiXjUuMi4xNFwiLFxuICAgIFwidml0ZS1wbHVnaW4tZHRzXCI6IFwiXjQuMy4wXCIsXG4gICAgXCJAbW9kdWxlLWZlZGVyYXRpb24vcnVudGltZVwiOiBcIndvcmtzcGFjZToqXCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVyxT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
