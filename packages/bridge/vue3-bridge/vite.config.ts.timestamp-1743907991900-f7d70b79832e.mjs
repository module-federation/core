// vite.config.ts
import { defineConfig } from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite@5.4.12_@types+node@18.16.9_less@4.2.2_stylus@0.64.0/node_modules/vite/dist/node/index.js';
import vue from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/@vitejs+plugin-vue@5.1.4_vite@5.4.12_vue@3.5.10/node_modules/@vitejs/plugin-vue/dist/index.mjs';
import path from 'path';
import dts from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite-plugin-dts@4.3.0_@types+node@18.16.9_rollup@4.24.0_typescript@5.5.2_vite@5.4.12/node_modules/vite-plugin-dts/dist/index.mjs';
import vueJsx from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.0.1_vite@5.4.12_vue@3.5.10/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs';

// package.json
var package_default = {
  name: '@module-federation/bridge-vue3',
  author: 'zhouxiao <codingzx@gmail.com>',
  license: 'MIT',
  repository: {
    type: 'git',
    url: 'https://github.com/module-federation/core',
    directory: 'packages/vue3-bridge',
  },
  version: '0.11.3',
  publishConfig: {
    access: 'public',
  },
  type: 'module',
  main: './dist/index.cjs',
  module: './dist/index.js',
  types: './dist/index.d.ts',
  files: [
    'dist/',
    'src/',
    'CHANGELOG.md',
    'LICENSE',
    'package.json',
    'project.json',
    'README.md',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts',
  ],
  scripts: {
    dev: 'vite',
    build: 'vite build',
    preview: 'vite preview',
  },
  peerDependencies: {
    vue: '=3',
    'vue-router': '=4',
  },
  dependencies: {
    '@module-federation/bridge-shared': 'workspace:*',
    '@module-federation/sdk': 'workspace:*',
    '@module-federation/runtime': 'workspace:*',
  },
  devDependencies: {
    '@vitejs/plugin-vue': '^5.0.4',
    '@vitejs/plugin-vue-jsx': '^4.0.0',
    typescript: '^5.2.2',
    vite: '^5.4.12',
    'vite-plugin-dts': '^4.3.0',
    vue: '^3.4.21',
    'vue-router': '4.4.5',
    'vue-tsc': '^2.0.6',
  },
};

// vite.config.ts
var __vite_injected_original_dirname =
  '/Users/bytedance/dev/universe/packages/bridge/vue3-bridge';
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      bundledPackages: ['@module-federation/bridge-shared'],
    }),
    vueJsx(),
  ],
  build: {
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, 'src/index.ts'),
      formats: ['cjs', 'es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: ['vue', 'vue-router'],
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(package_default.version),
  },
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL3Z1ZTMtYnJpZGdlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYnl0ZWRhbmNlL2Rldi91bml2ZXJzZS9wYWNrYWdlcy9icmlkZ2UvdnVlMy1icmlkZ2Uvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL3Z1ZTMtYnJpZGdlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCc7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgZHRzKHtcbiAgICAgIHJvbGx1cFR5cGVzOiB0cnVlLFxuICAgICAgYnVuZGxlZFBhY2thZ2VzOiBbJ0Btb2R1bGUtZmVkZXJhdGlvbi9icmlkZ2Utc2hhcmVkJ10sXG4gICAgfSksXG4gICAgdnVlSnN4KCksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC50cycpLFxuICAgICAgZm9ybWF0czogWydjanMnLCAnZXMnXSxcbiAgICAgIGZpbGVOYW1lOiAnaW5kZXgnLFxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInXSxcbiAgICB9LFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHBhY2thZ2VKc29uLnZlcnNpb24pLFxuICB9LFxufSk7XG4iLCAie1xuICBcIm5hbWVcIjogXCJAbW9kdWxlLWZlZGVyYXRpb24vYnJpZGdlLXZ1ZTNcIixcbiAgXCJhdXRob3JcIjogXCJ6aG91eGlhbyA8Y29kaW5nenhAZ21haWwuY29tPlwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJyZXBvc2l0b3J5XCI6IHtcbiAgICBcInR5cGVcIjogXCJnaXRcIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9tb2R1bGUtZmVkZXJhdGlvbi9jb3JlXCIsXG4gICAgXCJkaXJlY3RvcnlcIjogXCJwYWNrYWdlcy92dWUzLWJyaWRnZVwiXG4gIH0sXG4gIFwidmVyc2lvblwiOiBcIjAuMTEuM1wiLFxuICBcInB1Ymxpc2hDb25maWdcIjoge1xuICAgIFwiYWNjZXNzXCI6IFwicHVibGljXCJcbiAgfSxcbiAgXCJ0eXBlXCI6IFwibW9kdWxlXCIsXG4gIFwibWFpblwiOiBcIi4vZGlzdC9pbmRleC5janNcIixcbiAgXCJtb2R1bGVcIjogXCIuL2Rpc3QvaW5kZXguanNcIixcbiAgXCJ0eXBlc1wiOiBcIi4vZGlzdC9pbmRleC5kLnRzXCIsXG4gIFwiZmlsZXNcIjogW1xuICAgIFwiZGlzdC9cIixcbiAgICBcInNyYy9cIixcbiAgICBcIkNIQU5HRUxPRy5tZFwiLFxuICAgIFwiTElDRU5TRVwiLFxuICAgIFwicGFja2FnZS5qc29uXCIsXG4gICAgXCJwcm9qZWN0Lmpzb25cIixcbiAgICBcIlJFQURNRS5tZFwiLFxuICAgIFwidHNjb25maWcuanNvblwiLFxuICAgIFwidHNjb25maWcubm9kZS5qc29uXCIsXG4gICAgXCJ2aXRlLmNvbmZpZy50c1wiXG4gIF0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIlxuICB9LFxuICBcInBlZXJEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwidnVlXCI6IFwiPTNcIixcbiAgICBcInZ1ZS1yb3V0ZXJcIjogXCI9NFwiXG4gIH0sXG4gIFwiZGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBtb2R1bGUtZmVkZXJhdGlvbi9icmlkZ2Utc2hhcmVkXCI6IFwid29ya3NwYWNlOipcIixcbiAgICBcIkBtb2R1bGUtZmVkZXJhdGlvbi9zZGtcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwiQG1vZHVsZS1mZWRlcmF0aW9uL3J1bnRpbWVcIjogXCJ3b3Jrc3BhY2U6KlwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIl41LjAuNFwiLFxuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlLWpzeFwiOiBcIl40LjAuMFwiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjIuMlwiLFxuICAgIFwidml0ZVwiOiBcIl41LjQuMTJcIixcbiAgICBcInZpdGUtcGx1Z2luLWR0c1wiOiBcIl40LjMuMFwiLFxuICAgIFwidnVlXCI6IFwiXjMuNC4yMVwiLFxuICAgIFwidnVlLXJvdXRlclwiOiBcIjQuNC41XCIsXG4gICAgXCJ2dWUtdHNjXCI6IFwiXjIuMC42XCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2VixTQUFTLG9CQUFvQjtBQUMxWCxPQUFPLFNBQVM7QUFDaEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sU0FBUztBQUNoQixPQUFPLFlBQVk7OztBQ0puQjtBQUFBLEVBQ0UsTUFBUTtBQUFBLEVBQ1IsUUFBVTtBQUFBLEVBQ1YsU0FBVztBQUFBLEVBQ1gsWUFBYztBQUFBLElBQ1osTUFBUTtBQUFBLElBQ1IsS0FBTztBQUFBLElBQ1AsV0FBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFNBQVc7QUFBQSxFQUNYLGVBQWlCO0FBQUEsSUFDZixRQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0EsTUFBUTtBQUFBLEVBQ1IsTUFBUTtBQUFBLEVBQ1IsUUFBVTtBQUFBLEVBQ1YsT0FBUztBQUFBLEVBQ1QsT0FBUztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFXO0FBQUEsSUFDVCxLQUFPO0FBQUEsSUFDUCxPQUFTO0FBQUEsSUFDVCxTQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0Esa0JBQW9CO0FBQUEsSUFDbEIsS0FBTztBQUFBLElBQ1AsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxjQUFnQjtBQUFBLElBQ2Qsb0NBQW9DO0FBQUEsSUFDcEMsMEJBQTBCO0FBQUEsSUFDMUIsOEJBQThCO0FBQUEsRUFDaEM7QUFBQSxFQUNBLGlCQUFtQjtBQUFBLElBQ2pCLHNCQUFzQjtBQUFBLElBQ3RCLDBCQUEwQjtBQUFBLElBQzFCLFlBQWM7QUFBQSxJQUNkLE1BQVE7QUFBQSxJQUNSLG1CQUFtQjtBQUFBLElBQ25CLEtBQU87QUFBQSxJQUNQLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQSxFQUNiO0FBQ0Y7OztBRHJEQSxJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsTUFDRixhQUFhO0FBQUEsTUFDYixpQkFBaUIsQ0FBQyxrQ0FBa0M7QUFBQSxJQUN0RCxDQUFDO0FBQUEsSUFDRCxPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQzdDLFNBQVMsQ0FBQyxPQUFPLElBQUk7QUFBQSxNQUNyQixVQUFVO0FBQUEsSUFDWjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLE9BQU8sWUFBWTtBQUFBLElBQ2hDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04saUJBQWlCLEtBQUssVUFBVSxnQkFBWSxPQUFPO0FBQUEsRUFDckQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
