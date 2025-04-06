// vite.config.ts
import { defineConfig } from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite@5.4.12_@types+node@18.16.9_less@4.2.2_stylus@0.64.0/node_modules/vite/dist/node/index.js';
import path from 'path';
import dts from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite-plugin-dts@4.3.0_@types+node@18.16.9_rollup@4.24.0_typescript@5.5.2_vite@5.4.12/node_modules/vite-plugin-dts/dist/index.mjs';

// package.json
var package_default = {
  name: '@module-federation/bridge-react',
  version: '0.11.3',
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
    '@module-federation/bridge-shared': 'workspace:*',
    '@module-federation/sdk': 'workspace:*',
    'react-error-boundary': '^4.1.2',
  },
  peerDependencies: {
    react: '>=16.9.0',
    'react-dom': '>=16.9.0',
    'react-router-dom': '^4 || ^5 || ^6 || ^7',
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
    vite: '^5.4.12',
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
        plugin: path.resolve(
          __vite_injected_original_dirname,
          'src/provider/plugin.ts',
        ),
        router: path.resolve(
          __vite_injected_original_dirname,
          'src/router/default.tsx',
        ),
        'router-v5': path.resolve(
          __vite_injected_original_dirname,
          'src/router/v5.tsx',
        ),
        'router-v6': path.resolve(
          __vite_injected_original_dirname,
          'src/router/v6.tsx',
        ),
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
    __APP_VERSION__: JSON.stringify(package_default.version),
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYnl0ZWRhbmNlL2Rldi91bml2ZXJzZS9wYWNrYWdlcy9icmlkZ2UvYnJpZGdlLXJlYWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG4vLyBpbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcbi8vIGltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xuXG5jb25zdCBwZXJEZXBzS2V5cyA9IE9iamVjdC5rZXlzKHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgZHRzKHtcbiAgICAgIHJvbGx1cFR5cGVzOiB0cnVlLFxuICAgICAgYnVuZGxlZFBhY2thZ2VzOiBbXG4gICAgICAgICdAbW9kdWxlLWZlZGVyYXRpb24vYnJpZGdlLXNoYXJlZCcsXG4gICAgICAgICdyZWFjdC1lcnJvci1ib3VuZGFyeScsXG4gICAgICBdLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHtcbiAgICAgICAgaW5kZXg6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcbiAgICAgICAgcGx1Z2luOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3Byb3ZpZGVyL3BsdWdpbi50cycpLFxuICAgICAgICByb3V0ZXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcm91dGVyL2RlZmF1bHQudHN4JyksXG4gICAgICAgICdyb3V0ZXItdjUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3JvdXRlci92NS50c3gnKSxcbiAgICAgICAgJ3JvdXRlci12Nic6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcm91dGVyL3Y2LnRzeCcpLFxuICAgICAgfSxcbiAgICAgIGZvcm1hdHM6IFsnY2pzJywgJ2VzJ10sXG4gICAgICBmaWxlTmFtZTogKGZvcm1hdCwgZW50cnlOYW1lKSA9PiBgJHtlbnRyeU5hbWV9LiR7Zm9ybWF0fS5qc2AsXG4gICAgfSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBleHRlcm5hbDogW1xuICAgICAgICAuLi5wZXJEZXBzS2V5cyxcbiAgICAgICAgJ0ByZW1peC1ydW4vcm91dGVyJyxcbiAgICAgICAgL3JlYWN0LWRvbVxcLy4qLyxcbiAgICAgICAgJ3JlYWN0LXJvdXRlcicsXG4gICAgICAgICdyZWFjdC1yb3V0ZXItZG9tLycsXG4gICAgICAgICdyZWFjdC1yb3V0ZXItZG9tL2luZGV4LmpzJyxcbiAgICAgICAgJ3JlYWN0LXJvdXRlci1kb20vZGlzdC9pbmRleC5qcycsXG4gICAgICBdLFxuICAgICAgcGx1Z2luczogW1xuICAgICAgICB7XG4gICAgICAgICAgbmFtZTogJ21vZGlmeS1vdXRwdXQtcGx1Z2luJyxcbiAgICAgICAgICBnZW5lcmF0ZUJ1bmRsZShvcHRpb25zLCBidW5kbGUpIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmlsZU5hbWUgaW4gYnVuZGxlKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGNodW5rID0gYnVuZGxlW2ZpbGVOYW1lXTtcbiAgICAgICAgICAgICAgaWYgKGZpbGVOYW1lLmluY2x1ZGVzKCdyb3V0ZXItdjYnKSAmJiBjaHVuay50eXBlID09PSAnY2h1bmsnKSB7XG4gICAgICAgICAgICAgICAgY2h1bmsuY29kZSA9IGNodW5rLmNvZGUucmVwbGFjZShcbiAgICAgICAgICAgICAgICAgIC8vIE1hdGNoICdyZWFjdC1yb3V0ZXItZG9tLycgZm9sbG93ZWQgYnkgc2luZ2xlIHF1b3RlcywgZG91YmxlIHF1b3Rlcywgb3IgYmFja3RpY2tzLCByZXBsYWNpbmcgb25seSAncmVhY3Qtcm91dGVyLWRvbS8nIHRvIHJlYWN0LXJvdXRlci12NiBkaXN0IGZpbGUgc3RydWN0dXJlXG4gICAgICAgICAgICAgICAgICAvcmVhY3Qtcm91dGVyLWRvbVxcLyg/PVtcXCdcXFwiXFxgXSkvZyxcbiAgICAgICAgICAgICAgICAgICdyZWFjdC1yb3V0ZXItZG9tL2Rpc3QvaW5kZXguanMnLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoZmlsZU5hbWUuaW5jbHVkZXMoJ3JvdXRlci12NScpICYmIGNodW5rLnR5cGUgPT09ICdjaHVuaycpIHtcbiAgICAgICAgICAgICAgICBjaHVuay5jb2RlID0gY2h1bmsuY29kZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAgICAgLy8gTWF0Y2ggJ3JlYWN0LXJvdXRlci1kb20vJyBmb2xsb3dlZCBieSBzaW5nbGUgcXVvdGVzLCBkb3VibGUgcXVvdGVzLCBvciBiYWNrdGlja3MsIHJlcGxhY2luZyBvbmx5ICdyZWFjdC1yb3V0ZXItZG9tLycgdG8gcmVhY3Qtcm91dGVyLXY1IGRpc3QgZmlsZSBzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgICAgIC9yZWFjdC1yb3V0ZXItZG9tXFwvKD89W1xcJ1xcXCJcXGBdKS9nLFxuICAgICAgICAgICAgICAgICAgJ3JlYWN0LXJvdXRlci1kb20vaW5kZXguanMnLFxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9LFxuICAgIG1pbmlmeTogZmFsc2UsXG4gIH0sXG4gIGRlZmluZToge1xuICAgIF9fQVBQX1ZFUlNJT05fXzogSlNPTi5zdHJpbmdpZnkocGFja2FnZUpzb24udmVyc2lvbiksXG4gIH0sXG59KTtcbiIsICJ7XG4gIFwibmFtZVwiOiBcIkBtb2R1bGUtZmVkZXJhdGlvbi9icmlkZ2UtcmVhY3RcIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4xMS4zXCIsXG4gIFwicHVibGlzaENvbmZpZ1wiOiB7XG4gICAgXCJhY2Nlc3NcIjogXCJwdWJsaWNcIlxuICB9LFxuICBcImF1dGhvclwiOiBcInpob3V4aWFvIDxjb2Rpbmd6eEBnbWFpbC5jb20+XCIsXG4gIFwibGljZW5zZVwiOiBcIk1JVFwiLFxuICBcInJlcG9zaXRvcnlcIjoge1xuICAgIFwidHlwZVwiOiBcImdpdFwiLFxuICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL21vZHVsZS1mZWRlcmF0aW9uL2NvcmVcIixcbiAgICBcImRpcmVjdG9yeVwiOiBcInBhY2thZ2VzL2JyaWRnZS1yZWFjdFwiXG4gIH0sXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcIm1haW5cIjogXCIuL2Rpc3QvaW5kZXguY2pzLmpzXCIsXG4gIFwibW9kdWxlXCI6IFwiLi9kaXN0L2luZGV4LmVzLmpzXCIsXG4gIFwidHlwZXNcIjogXCIuL2Rpc3QvaW5kZXguZC50c1wiLFxuICBcImV4cG9ydHNcIjoge1xuICAgIFwiLlwiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9kaXN0L2luZGV4LmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L2luZGV4LmVzLmpzXCIsXG4gICAgICBcInJlcXVpcmVcIjogXCIuL2Rpc3QvaW5kZXguY2pzLmpzXCJcbiAgICB9LFxuICAgIFwiLi9yb3V0ZXJcIjoge1xuICAgICAgXCJ0eXBlc1wiOiBcIi4vZGlzdC9yb3V0ZXIuZC50c1wiLFxuICAgICAgXCJpbXBvcnRcIjogXCIuL2Rpc3Qvcm91dGVyLmVzLmpzXCIsXG4gICAgICBcInJlcXVpcmVcIjogXCIuL2Rpc3Qvcm91dGVyLmNqcy5qc1wiXG4gICAgfSxcbiAgICBcIi4vcGx1Z2luXCI6IHtcbiAgICAgIFwidHlwZXNcIjogXCIuL2Rpc3QvcGx1Z2luLmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L3BsdWdpbi5lcy5qc1wiLFxuICAgICAgXCJyZXF1aXJlXCI6IFwiLi9kaXN0L3BsdWdpbi5lcy5qc1wiXG4gICAgfSxcbiAgICBcIi4vcm91dGVyLXY1XCI6IHtcbiAgICAgIFwidHlwZXNcIjogXCIuL2Rpc3Qvcm91dGVyLXY1LmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L3JvdXRlci12NS5lcy5qc1wiLFxuICAgICAgXCJyZXF1aXJlXCI6IFwiLi9kaXN0L3JvdXRlci12NS5janMuanNcIlxuICAgIH0sXG4gICAgXCIuL3JvdXRlci12NlwiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9kaXN0L3JvdXRlci12Ni5kLnRzXCIsXG4gICAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9yb3V0ZXItdjYuZXMuanNcIixcbiAgICAgIFwicmVxdWlyZVwiOiBcIi4vZGlzdC9yb3V0ZXItdjYuY2pzLmpzXCJcbiAgICB9LFxuICAgIFwiLi8qXCI6IFwiLi8qXCJcbiAgfSxcbiAgXCJzY3JpcHRzXCI6IHtcbiAgICBcImRldlwiOiBcInZpdGVcIixcbiAgICBcImJ1aWxkXCI6IFwidml0ZSBidWlsZFwiLFxuICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBtb2R1bGUtZmVkZXJhdGlvbi9icmlkZ2Utc2hhcmVkXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkBtb2R1bGUtZmVkZXJhdGlvbi9zZGtcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwicmVhY3QtZXJyb3ItYm91bmRhcnlcIjogXCJeNC4xLjJcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwicmVhY3RcIjogXCI+PTE2LjkuMFwiLFxuICAgIFwicmVhY3QtZG9tXCI6IFwiPj0xNi45LjBcIixcbiAgICBcInJlYWN0LXJvdXRlci1kb21cIjogXCJeNCB8fCBeNSB8fCBeNiB8fCBeN1wiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB0ZXN0aW5nLWxpYnJhcnkvcmVhY3RcIjogXCIxNS4wLjdcIixcbiAgICBcIkB0eXBlcy9yZWFjdFwiOiBcIjE4LjIuNzlcIixcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCIxOC4zLjBcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMy4zXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWVcIjogXCJeNS4wLjRcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjogXCJeNC4wLjBcIixcbiAgICBcImpzZG9tXCI6IFwiXjI0LjEuMFwiLFxuICAgIFwicmVhY3RcIjogXCIxOC4zLjFcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIjE4LjMuMVwiLFxuICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiOiBcIjYuMjIuM1wiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjIuMlwiLFxuICAgIFwidml0ZVwiOiBcIl41LjQuMTJcIixcbiAgICBcInZpdGUtcGx1Z2luLWR0c1wiOiBcIl40LjMuMFwiLFxuICAgIFwiQG1vZHVsZS1mZWRlcmF0aW9uL3J1bnRpbWVcIjogXCJ3b3Jrc3BhY2U6KlwiXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7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
