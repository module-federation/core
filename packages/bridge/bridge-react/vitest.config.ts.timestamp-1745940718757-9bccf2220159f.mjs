// packages/bridge/bridge-react/vitest.config.ts
import { defineConfig } from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/vitest@1.6.0_@types+node@18.16.9_@vitest+ui@1.6.0_less@4.3.0_stylus@0.64.0/node_modules/vitest/dist/config.js';
import { nxViteTsPaths } from 'file:///Users/bytedance/dev/universe/node_modules/.pnpm/@nx+vite@20.1.4_@swc-node+register@1.10.10_@swc+core@1.7.26_@types+node@18.16.9_nx@20.1.4_typ_34uaw54j4pjkmd7qmec6tvvfiu/node_modules/@nx/vite/plugins/nx-tsconfig-paths.plugin.js';
import path from 'path';
var __vite_injected_original_dirname =
  '/Users/bytedance/dev/universe/packages/bridge/bridge-react';
var vitest_config_default = defineConfig({
  define: {
    __DEV__: true,
    __TEST__: true,
    __BROWSER__: false,
    __VERSION__: '"unknown"',
    __APP_VERSION__: '"0.0.0"',
  },
  plugins: [nxViteTsPaths()],
  test: {
    environment: 'jsdom',
    include: [
      path.resolve(__vite_injected_original_dirname, '__tests__/*.spec.ts'),
      path.resolve(__vite_injected_original_dirname, '__tests__/*.spec.tsx'),
    ],
    globals: true,
    testTimeout: 1e4,
  },
});
export { vitest_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdC92aXRlc3QuY29uZmlnLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2J5dGVkYW5jZS9kZXYvdW5pdmVyc2UvcGFja2FnZXMvYnJpZGdlL2JyaWRnZS1yZWFjdC92aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9ieXRlZGFuY2UvZGV2L3VuaXZlcnNlL3BhY2thZ2VzL2JyaWRnZS9icmlkZ2UtcmVhY3Qvdml0ZXN0LmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnO1xuaW1wb3J0IHsgbnhWaXRlVHNQYXRocyB9IGZyb20gJ0BueC92aXRlL3BsdWdpbnMvbngtdHNjb25maWctcGF0aHMucGx1Z2luJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgZGVmaW5lOiB7XG4gICAgX19ERVZfXzogdHJ1ZSxcbiAgICBfX1RFU1RfXzogdHJ1ZSxcbiAgICBfX0JST1dTRVJfXzogZmFsc2UsXG4gICAgX19WRVJTSU9OX186ICdcInVua25vd25cIicsXG4gICAgX19BUFBfVkVSU0lPTl9fOiAnXCIwLjAuMFwiJyxcbiAgfSxcbiAgcGx1Z2luczogW254Vml0ZVRzUGF0aHMoKV0sXG4gIHRlc3Q6IHtcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICBpbmNsdWRlOiBbXG4gICAgICBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnX190ZXN0c19fLyouc3BlYy50cycpLFxuICAgICAgcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ19fdGVzdHNfXy8qLnNwZWMudHN4JyksXG4gICAgXSxcbiAgICBnbG9iYWxzOiB0cnVlLFxuICAgIHRlc3RUaW1lb3V0OiAxMDAwMCxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFvVyxTQUFTLG9CQUFvQjtBQUNqWSxTQUFTLHFCQUFxQjtBQUM5QixPQUFPLFVBQVU7QUFGakIsSUFBTSxtQ0FBbUM7QUFHekMsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsUUFBUTtBQUFBLElBQ04sU0FBUztBQUFBLElBQ1QsVUFBVTtBQUFBLElBQ1YsYUFBYTtBQUFBLElBQ2IsYUFBYTtBQUFBLElBQ2IsaUJBQWlCO0FBQUEsRUFDbkI7QUFBQSxFQUNBLFNBQVMsQ0FBQyxjQUFjLENBQUM7QUFBQSxFQUN6QixNQUFNO0FBQUEsSUFDSixhQUFhO0FBQUEsSUFDYixTQUFTO0FBQUEsTUFDUCxLQUFLLFFBQVEsa0NBQVcscUJBQXFCO0FBQUEsTUFDN0MsS0FBSyxRQUFRLGtDQUFXLHNCQUFzQjtBQUFBLElBQ2hEO0FBQUEsSUFDQSxTQUFTO0FBQUEsSUFDVCxhQUFhO0FBQUEsRUFDZjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
