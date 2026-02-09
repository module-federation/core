// Clean up lingering Federation global state to avoid cross-case pollution
if ((globalThis as any).__FEDERATION__) {
  (globalThis as any).__GLOBAL_LOADING_REMOTE_ENTRY__ = {};
  //@ts-ignore
  (globalThis as any).__FEDERATION__.__INSTANCES__.map((i: any) => {
    i.moduleCache.clear();
    if ((globalThis as any)[i.name]) {
      delete (globalThis as any)[i.name];
    }
  });
  (globalThis as any).__FEDERATION__.__INSTANCES__ = [];
}

import { describeCases } from './ConfigTestCases.rstest';

rs.resetModules();

describeCases({
  // Unique name to keep test/js output isolated from other config-case suites.
  name: 'ConfigTestCases-treeshake',
  includeCategories: ['tree-shaking-share'],
});
