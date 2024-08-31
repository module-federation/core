// vite.config.ts
import { defineConfig } from "file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite@5.2.11_@types+node@18.16.9_less@4.2.0_stylus@0.63.0/node_modules/vite/dist/node/index.js";
import path from "path";
import dts from "file:///Users/bytedance/dev/universe/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@18.16.9_rollup@4.19.0_typescript@5.5.2_vite@5.2.11/node_modules/vite-plugin-dts/dist/index.mjs";

// package.json
var package_default = {
  name: "@module-federation/bridge-react",
  version: "0.6.0",
  publishConfig: {
    access: "public"
  },
  author: "zhouxiao <codingzx@gmail.com>",
  type: "module",
  main: "./dist/index.cjs.js",
  module: "./dist/index.es.js",
  types: "./dist/index.d.ts",
  exports: {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.es.js",
      require: "./dist/index.cjs.js"
    },
    "./router": {
      types: "./dist/router.d.ts",
      import: "./dist/router.es.js",
      require: "./dist/router.cjs.js"
    },
    "./router-v5": {
      types: "./dist/router-v5.d.ts",
      import: "./dist/router-v5.es.js",
      require: "./dist/router-v5.cjs.js"
    },
    "./router-v6": {
      types: "./dist/router-v6.d.ts",
      import: "./dist/router-v6.es.js",
      require: "./dist/router-v6.cjs.js"
    },
    "./*": "./*"
  },
  scripts: {
    dev: "vite",
    build: "vite build",
    preview: "vite preview"
  },
  dependencies: {
    "@loadable/component": "^5.16.4",
    "@module-federation/bridge-shared": "workspace:*",
    "react-error-boundary": "^4.0.13"
  },
  peerDependencies: {
    react: ">=16.9.0",
    "react-dom": ">=16.9.0",
    "react-router-dom": ">=4"
  },
  devDependencies: {
    "@testing-library/react": "15.0.7",
    "@types/react": "18.2.79",
    "@types/react-dom": "18.2.25",
    "@vitejs/plugin-react": "^4.3.0",
    "@vitejs/plugin-vue": "^5.0.4",
    "@vitejs/plugin-vue-jsx": "^4.0.0",
    jsdom: "^24.1.0",
    react: "18.1.0",
    "react-dom": "18.1.0",
    "react-router-dom": "6.22.3",
    typescript: "^5.2.2",
    vite: "^5.2.0",
    "vite-plugin-dts": "^3.9.1"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "/Users/bytedance/dev/universe/packages/bridge/bridge-react";
var perDepsKeys = Object.keys(package_default.peerDependencies);
var vite_config_default = defineConfig({
  plugins: [
    dts({
      rollupTypes: true,
      bundledPackages: [
        "@module-federation/bridge-shared",
        "react-error-boundary"
      ]
    })
  ],
  build: {
    lib: {
      entry: {
        index: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
        router: path.resolve(__vite_injected_original_dirname, "src/router.tsx"),
        "router-v5": path.resolve(__vite_injected_original_dirname, "src/router-v5.tsx"),
        "router-v6": path.resolve(__vite_injected_original_dirname, "src/router-v6.tsx")
      },
      formats: ["cjs", "es"],
      fileName: (format, entryName) => `${entryName}.${format}.js`
    },
    rollupOptions: {
      external: [
        ...perDepsKeys,
        "@remix-run/router",
        "react-router",
        "react-router-dom/",
        "react-router-dom/index.js",
        "react-router-dom/dist/index.js"
      ],
      plugins: [
        {
          name: "modify-output-plugin",
          generateBundle(options, bundle) {
            for (const fileName in bundle) {
              const chunk = bundle[fileName];
              if (fileName.includes("router-v5") && chunk.type === "chunk") {
                chunk.code = chunk.code.replace(
                  // Match 'react-router-dom/' followed by single quotes, double quotes, or backticks, replacing only 'react-router-dom/' to react-router-v5 dist file structure
                  /react-router-dom\/(?=[\'\"\`])/g,
                  "react-router-dom/index.js"
                );
              }
            }
          }
        }
      ]
    },
    minify: false
  },
  define: {
    __APP_VERSION__: JSON.stringify(package_default.version)
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvYnl0ZWRhbmNlL2Rldi91bml2ZXJzZS9wYWNrYWdlcy9icmlkZ2UvYnJpZGdlLXJlYWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGFja2FnZUpzb24gZnJvbSAnLi9wYWNrYWdlLmpzb24nO1xuXG5jb25zdCBwZXJEZXBzS2V5cyA9IE9iamVjdC5rZXlzKHBhY2thZ2VKc29uLnBlZXJEZXBlbmRlbmNpZXMpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgZHRzKHtcbiAgICAgIHJvbGx1cFR5cGVzOiB0cnVlLFxuICAgICAgYnVuZGxlZFBhY2thZ2VzOiBbXG4gICAgICAgICdAbW9kdWxlLWZlZGVyYXRpb24vYnJpZGdlLXNoYXJlZCcsXG4gICAgICAgICdyZWFjdC1lcnJvci1ib3VuZGFyeScsXG4gICAgICBdLFxuICAgIH0pLFxuICBdLFxuICBidWlsZDoge1xuICAgIGxpYjoge1xuICAgICAgZW50cnk6IHtcbiAgICAgICAgaW5kZXg6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcbiAgICAgICAgcm91dGVyOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnc3JjL3JvdXRlci50c3gnKSxcbiAgICAgICAgJ3JvdXRlci12NSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcm91dGVyLXY1LnRzeCcpLFxuICAgICAgICAncm91dGVyLXY2JzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9yb3V0ZXItdjYudHN4JyksXG4gICAgICB9LFxuICAgICAgZm9ybWF0czogWydjanMnLCAnZXMnXSxcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0LCBlbnRyeU5hbWUpID0+IGAke2VudHJ5TmFtZX0uJHtmb3JtYXR9LmpzYCxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbXG4gICAgICAgIC4uLnBlckRlcHNLZXlzLFxuICAgICAgICAnQHJlbWl4LXJ1bi9yb3V0ZXInLFxuICAgICAgICAncmVhY3Qtcm91dGVyJyxcbiAgICAgICAgJ3JlYWN0LXJvdXRlci1kb20vJyxcbiAgICAgICAgJ3JlYWN0LXJvdXRlci1kb20vaW5kZXguanMnLFxuICAgICAgICAncmVhY3Qtcm91dGVyLWRvbS9kaXN0L2luZGV4LmpzJyxcbiAgICAgIF0sXG4gICAgICBwbHVnaW5zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBuYW1lOiAnbW9kaWZ5LW91dHB1dC1wbHVnaW4nLFxuICAgICAgICAgIGdlbmVyYXRlQnVuZGxlKG9wdGlvbnMsIGJ1bmRsZSkge1xuICAgICAgICAgICAgZm9yIChjb25zdCBmaWxlTmFtZSBpbiBidW5kbGUpIHtcbiAgICAgICAgICAgICAgY29uc3QgY2h1bmsgPSBidW5kbGVbZmlsZU5hbWVdO1xuICAgICAgICAgICAgICAvLyBpZiAoZmlsZU5hbWUuaW5jbHVkZXMoJ3JvdXRlci12NicpICYmIGNodW5rLnR5cGUgPT09ICdjaHVuaycpIHtcbiAgICAgICAgICAgICAgLy8gICBjaHVuay5jb2RlID0gY2h1bmsuY29kZS5yZXBsYWNlKFxuICAgICAgICAgICAgICAvLyAgICAgLy8gTWF0Y2ggJ3JlYWN0LXJvdXRlci1kb20vJyBmb2xsb3dlZCBieSBzaW5nbGUgcXVvdGVzLCBkb3VibGUgcXVvdGVzLCBvciBiYWNrdGlja3MsIHJlcGxhY2luZyBvbmx5ICdyZWFjdC1yb3V0ZXItZG9tLycgdG8gcmVhY3Qtcm91dGVyLXY2IGRpc3QgZmlsZSBzdHJ1Y3R1cmVcbiAgICAgICAgICAgICAgLy8gICAgIC9yZWFjdC1yb3V0ZXItZG9tXFwvKD89W1xcJ1xcXCJcXGBdKS9nLFxuICAgICAgICAgICAgICAvLyAgICAgJ3JlYWN0LXJvdXRlci1kb20vZGlzdC9pbmRleC5qcycsXG4gICAgICAgICAgICAgIC8vICAgKTtcbiAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgIGlmIChmaWxlTmFtZS5pbmNsdWRlcygncm91dGVyLXY1JykgJiYgY2h1bmsudHlwZSA9PT0gJ2NodW5rJykge1xuICAgICAgICAgICAgICAgIGNodW5rLmNvZGUgPSBjaHVuay5jb2RlLnJlcGxhY2UoXG4gICAgICAgICAgICAgICAgICAvLyBNYXRjaCAncmVhY3Qtcm91dGVyLWRvbS8nIGZvbGxvd2VkIGJ5IHNpbmdsZSBxdW90ZXMsIGRvdWJsZSBxdW90ZXMsIG9yIGJhY2t0aWNrcywgcmVwbGFjaW5nIG9ubHkgJ3JlYWN0LXJvdXRlci1kb20vJyB0byByZWFjdC1yb3V0ZXItdjUgZGlzdCBmaWxlIHN0cnVjdHVyZVxuICAgICAgICAgICAgICAgICAgL3JlYWN0LXJvdXRlci1kb21cXC8oPz1bXFwnXFxcIlxcYF0pL2csXG4gICAgICAgICAgICAgICAgICAncmVhY3Qtcm91dGVyLWRvbS9pbmRleC5qcycsXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0sXG4gICAgbWluaWZ5OiBmYWxzZSxcbiAgfSxcbiAgZGVmaW5lOiB7XG4gICAgX19BUFBfVkVSU0lPTl9fOiBKU09OLnN0cmluZ2lmeShwYWNrYWdlSnNvbi52ZXJzaW9uKSxcbiAgfSxcbn0pO1xuIiwgIntcbiAgXCJuYW1lXCI6IFwiQG1vZHVsZS1mZWRlcmF0aW9uL2JyaWRnZS1yZWFjdFwiLFxuICBcInZlcnNpb25cIjogXCIwLjYuMFwiLFxuICBcInB1Ymxpc2hDb25maWdcIjoge1xuICAgIFwiYWNjZXNzXCI6IFwicHVibGljXCJcbiAgfSxcbiAgXCJhdXRob3JcIjogXCJ6aG91eGlhbyA8Y29kaW5nenhAZ21haWwuY29tPlwiLFxuICBcInR5cGVcIjogXCJtb2R1bGVcIixcbiAgXCJtYWluXCI6IFwiLi9kaXN0L2luZGV4LmNqcy5qc1wiLFxuICBcIm1vZHVsZVwiOiBcIi4vZGlzdC9pbmRleC5lcy5qc1wiLFxuICBcInR5cGVzXCI6IFwiLi9kaXN0L2luZGV4LmQudHNcIixcbiAgXCJleHBvcnRzXCI6IHtcbiAgICBcIi5cIjoge1xuICAgICAgXCJ0eXBlc1wiOiBcIi4vZGlzdC9pbmRleC5kLnRzXCIsXG4gICAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9pbmRleC5lcy5qc1wiLFxuICAgICAgXCJyZXF1aXJlXCI6IFwiLi9kaXN0L2luZGV4LmNqcy5qc1wiXG4gICAgfSxcbiAgICBcIi4vcm91dGVyXCI6IHtcbiAgICAgIFwidHlwZXNcIjogXCIuL2Rpc3Qvcm91dGVyLmQudHNcIixcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L3JvdXRlci5lcy5qc1wiLFxuICAgICAgXCJyZXF1aXJlXCI6IFwiLi9kaXN0L3JvdXRlci5janMuanNcIlxuICAgIH0sXG4gICAgXCIuL3JvdXRlci12NVwiOiB7XG4gICAgICBcInR5cGVzXCI6IFwiLi9kaXN0L3JvdXRlci12NS5kLnRzXCIsXG4gICAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9yb3V0ZXItdjUuZXMuanNcIixcbiAgICAgIFwicmVxdWlyZVwiOiBcIi4vZGlzdC9yb3V0ZXItdjUuY2pzLmpzXCJcbiAgICB9LFxuICAgIFwiLi9yb3V0ZXItdjZcIjoge1xuICAgICAgXCJ0eXBlc1wiOiBcIi4vZGlzdC9yb3V0ZXItdjYuZC50c1wiLFxuICAgICAgXCJpbXBvcnRcIjogXCIuL2Rpc3Qvcm91dGVyLXY2LmVzLmpzXCIsXG4gICAgICBcInJlcXVpcmVcIjogXCIuL2Rpc3Qvcm91dGVyLXY2LmNqcy5qc1wiXG4gICAgfSxcbiAgICBcIi4vKlwiOiBcIi4vKlwiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJkZXZcIjogXCJ2aXRlXCIsXG4gICAgXCJidWlsZFwiOiBcInZpdGUgYnVpbGRcIixcbiAgICBcInByZXZpZXdcIjogXCJ2aXRlIHByZXZpZXdcIlxuICB9LFxuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJAbG9hZGFibGUvY29tcG9uZW50XCI6IFwiXjUuMTYuNFwiLFxuICAgIFwiQG1vZHVsZS1mZWRlcmF0aW9uL2JyaWRnZS1zaGFyZWRcIjogXCJ3b3Jrc3BhY2U6KlwiLFxuICAgIFwicmVhY3QtZXJyb3ItYm91bmRhcnlcIjogXCJeNC4wLjEzXCJcbiAgfSxcbiAgXCJwZWVyRGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcInJlYWN0XCI6IFwiPj0xNi45LjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIj49MTYuOS4wXCIsXG4gICAgXCJyZWFjdC1yb3V0ZXItZG9tXCI6IFwiPj00XCJcbiAgfSxcbiAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQHRlc3RpbmctbGlicmFyeS9yZWFjdFwiOiBcIjE1LjAuN1wiLFxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiMTguMi43OVwiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRvbVwiOiBcIjE4LjIuMjVcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI6IFwiXjQuMy4wXCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi12dWVcIjogXCJeNS4wLjRcIixcbiAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZS1qc3hcIjogXCJeNC4wLjBcIixcbiAgICBcImpzZG9tXCI6IFwiXjI0LjEuMFwiLFxuICAgIFwicmVhY3RcIjogXCIxOC4xLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIjE4LjEuMFwiLFxuICAgIFwicmVhY3Qtcm91dGVyLWRvbVwiOiBcIjYuMjIuM1wiLFxuICAgIFwidHlwZXNjcmlwdFwiOiBcIl41LjIuMlwiLFxuICAgIFwidml0ZVwiOiBcIl41LjIuMFwiLFxuICAgIFwidml0ZS1wbHVnaW4tZHRzXCI6IFwiXjMuOS4xXCJcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFnVyxTQUFTLG9CQUFvQjtBQUU3WCxPQUFPLFVBQVU7QUFDakIsT0FBTyxTQUFTOzs7QUNIaEI7QUFBQSxFQUNFLE1BQVE7QUFBQSxFQUNSLFNBQVc7QUFBQSxFQUNYLGVBQWlCO0FBQUEsSUFDZixRQUFVO0FBQUEsRUFDWjtBQUFBLEVBQ0EsUUFBVTtBQUFBLEVBQ1YsTUFBUTtBQUFBLEVBQ1IsTUFBUTtBQUFBLEVBQ1IsUUFBVTtBQUFBLEVBQ1YsT0FBUztBQUFBLEVBQ1QsU0FBVztBQUFBLElBQ1QsS0FBSztBQUFBLE1BQ0gsT0FBUztBQUFBLE1BQ1QsUUFBVTtBQUFBLE1BQ1YsU0FBVztBQUFBLElBQ2I7QUFBQSxJQUNBLFlBQVk7QUFBQSxNQUNWLE9BQVM7QUFBQSxNQUNULFFBQVU7QUFBQSxNQUNWLFNBQVc7QUFBQSxJQUNiO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixPQUFTO0FBQUEsTUFDVCxRQUFVO0FBQUEsTUFDVixTQUFXO0FBQUEsSUFDYjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsT0FBUztBQUFBLE1BQ1QsUUFBVTtBQUFBLE1BQ1YsU0FBVztBQUFBLElBQ2I7QUFBQSxJQUNB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
