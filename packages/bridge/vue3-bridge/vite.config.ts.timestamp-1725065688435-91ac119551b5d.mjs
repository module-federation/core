// vite.config.ts
import { defineConfig } from "file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite@5.2.11_@types+node@18.16.9_less@4.2.0_stylus@0.63.0/node_modules/vite/dist/node/index.js";
import vue from "file:///Users/bytedance/dev/universe/node_modules/.pnpm/@vitejs+plugin-vue@5.1.0_vite@5.2.11_vue@3.4.34/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import dts from "file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@18.16.9_rollup@4.19.0_typescript@5.5.2_vite@5.2.11/node_modules/vite-plugin-dts/dist/index.mjs";
import vueJsx from "file:///Users/bytedance/dev/universe/node_modules/.pnpm/@vitejs+plugin-vue-jsx@4.0.0_vite@5.2.11_vue@3.4.34/node_modules/@vitejs/plugin-vue-jsx/dist/index.mjs";

// package.json
var package_default = {
  name: "@module-federation/bridge-vue3",
  author: "zhouxiao <codingzx@gmail.com>",
  version: "0.6.0",
  publishConfig: {
    access: "public"
  },
  type: "module",
  main: "./dist/index.cjs.js",
  module: "./dist/index.es.js",
  types: "./dist/index.d.ts",
  files: [
    "dist/",
    "src/",
    "CHANGELOG.md",
    "LICENSE",
    "package.json",
    "project.json",
    "README.md",
    "tsconfig.json",
    "tsconfig.node.json",
    "vite.config.ts"
  ],
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview"
  },
  peerDependencies: {
    vue: "=3",
    "vue-router": "=3"
  },
  dependencies: {
    "@module-federation/bridge-shared": "workspace:*"
  },
  devDependencies: {
    "@vitejs/plugin-vue": "^5.0.4",
    "@vitejs/plugin-vue-jsx": "^4.0.0",
    typescript: "^5.2.2",
    vite: "^5.2.0",
    "vite-plugin-dts": "^3.9.1",
    vue: "^3.4.21",
    "vue-router": "4.3.2",
    "vue-tsc": "^2.0.6"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "/Users/bytedance/dev/universe/packages/bridge/vue3-bridge";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    dts({
      rollupTypes: true,
      bundledPackages: ["@module-federation/bridge-shared"]
    }),
    vueJsx()
  ],
  build: {
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
      formats: ["cjs", "es"],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ["vue", "vue-router"]
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(package_default.version)
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL3Z1ZTMtYnJpZGdlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYnl0ZWRhbmNlL2Rldi91bml2ZXJzZS9wYWNrYWdlcy9icmlkZ2UvdnVlMy1icmlkZ2Uvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL3Z1ZTMtYnJpZGdlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcbmltcG9ydCB2dWVKc3ggZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlLWpzeCc7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgZHRzKHtcbiAgICAgIHJvbGx1cFR5cGVzOiB0cnVlLFxuICAgICAgYnVuZGxlZFBhY2thZ2VzOiBbJ0Btb2R1bGUtZmVkZXJhdGlvbi9icmlkZ2Utc2hhcmVkJ10sXG4gICAgfSksXG4gICAgdnVlSnN4KCksXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgbGliOiB7XG4gICAgICBlbnRyeTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC50cycpLFxuICAgICAgZm9ybWF0czogWydjanMnLCAnZXMnXSxcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXR9LmpzYCxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbJ3Z1ZScsICd2dWUtcm91dGVyJ10sXG4gICAgfSxcbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgX19BUFBfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbi52ZXJzaW9uKSxcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiQG1vZHVsZS1mZWRlcmF0aW9uL2JyaWRnZS12dWUzXCIsXG4gIFwiYXV0aG9yXCI6IFwiemhvdXhpYW8gPGNvZGluZ3p4QGdtYWlsLmNvbT5cIixcbiAgXCJ2ZXJzaW9uXCI6IFwiMC42LjBcIixcbiAgXCJwdWJsaXNoQ29uZmlnXCI6IHtcbiAgICBcImFjY2Vzc1wiOiBcInB1YmxpY1wiXG4gIH0sXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcIm1haW5cIjogXCIuL2Rpc3QvaW5kZXguY2pzLmpzXCIsXG4gIFwibW9kdWxlXCI6IFwiLi9kaXN0L2luZGV4LmVzLmpzXCIsXG4gIFwidHlwZXNcIjogXCIuL2Rpc3QvaW5kZXguZC50c1wiLFxuICBcImZpbGVzXCI6IFtcbiAgICBcImRpc3QvXCIsXG4gICAgXCJzcmMvXCIsXG4gICAgXCJDSEFOR0VMT0cubWRcIixcbiAgICBcIkxJQ0VOU0VcIixcbiAgICBcInBhY2thZ2UuanNvblwiLFxuICAgIFwicHJvamVjdC5qc29uXCIsXG4gICAgXCJSRUFETUUubWRcIixcbiAgICBcInRzY29uZmlnLmpzb25cIixcbiAgICBcInRzY29uZmlnLm5vZGUuanNvblwiLFxuICAgIFwidml0ZS5jb25maWcudHNcIlxuICBdLFxuICBcInNjcmlwdHNcIjoge1xuICAgIFwiZGV2XCI6IFwidml0ZVwiLFxuICAgIFwiYnVpbGRcIjogXCJ2aXRlIGJ1aWxkXCIsXG4gICAgXCJwcmV2aWV3XCI6IFwidml0ZSBwcmV2aWV3XCJcbiAgfSxcbiAgXCJwZWVyRGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcInZ1ZVwiOiBcIj0zXCIsXG4gICAgXCJ2dWUtcm91dGVyXCI6IFwiPTNcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAbW9kdWxlLWZlZGVyYXRpb24vYnJpZGdlLXNoYXJlZFwiOiBcIndvcmtzcGFjZToqXCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHZpdGVqcy9wbHVnaW4tdnVlXCI6IFwiXjUuMC40XCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWUtanN4XCI6IFwiXjQuMC4wXCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjUuMi4yXCIsXG4gICAgXCJ2aXRlXCI6IFwiXjUuMi4wXCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1kdHNcIjogXCJeMy45LjFcIixcbiAgICBcInZ1ZVwiOiBcIl4zLjQuMjFcIixcbiAgICBcInZ1ZS1yb3V0ZXJcIjogXCI0LjMuMlwiLFxuICAgIFwidnVlLXRzY1wiOiBcIl4yLjAuNlwiXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlYsU0FBUyxvQkFBb0I7QUFDMVgsT0FBTyxTQUFTO0FBQ2hCLE9BQU8sVUFBVTtBQUNqQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxZQUFZOzs7QUNKbkI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFFBQVU7QUFBQSxFQUNWLFNBQVc7QUFBQSxFQUNYLGVBQWlCO0FBQUEsSUFDZixRQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0EsTUFBUTtBQUFBLEVBQ1IsTUFBUTtBQUFBLEVBQ1IsUUFBVTtBQUFBLEVBQ1YsT0FBUztBQUFBLEVBQ1QsT0FBUztBQUFBLElBQ1A7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxJQUNBO0FBQUEsSUFDQTtBQUFBLElBQ0E7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFXO0FBQUEsSUFDVCxLQUFPO0FBQUEsSUFDUCxPQUFTO0FBQUEsSUFDVCxTQUFXO0FBQUEsRUFDYjtBQUFBLEVBQ0Esa0JBQW9CO0FBQUEsSUFDbEIsS0FBTztBQUFBLElBQ1AsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxjQUFnQjtBQUFBLElBQ2Qsb0NBQW9DO0FBQUEsRUFDdEM7QUFBQSxFQUNBLGlCQUFtQjtBQUFBLElBQ2pCLHNCQUFzQjtBQUFBLElBQ3RCLDBCQUEwQjtBQUFBLElBQzFCLFlBQWM7QUFBQSxJQUNkLE1BQVE7QUFBQSxJQUNSLG1CQUFtQjtBQUFBLElBQ25CLEtBQU87QUFBQSxJQUNQLGNBQWM7QUFBQSxJQUNkLFdBQVc7QUFBQSxFQUNiO0FBQ0Y7OztBRDdDQSxJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxJQUFJO0FBQUEsSUFDSixJQUFJO0FBQUEsTUFDRixhQUFhO0FBQUEsTUFDYixpQkFBaUIsQ0FBQyxrQ0FBa0M7QUFBQSxJQUN0RCxDQUFDO0FBQUEsSUFDRCxPQUFPO0FBQUEsRUFDVDtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQzdDLFNBQVMsQ0FBQyxPQUFPLElBQUk7QUFBQSxNQUNyQixVQUFVLENBQUMsV0FBVyxTQUFTLE1BQU07QUFBQSxJQUN2QztBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsVUFBVSxDQUFDLE9BQU8sWUFBWTtBQUFBLElBQ2hDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04saUJBQWlCLEtBQUssVUFBVSxnQkFBWSxPQUFPO0FBQUEsRUFDckQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
