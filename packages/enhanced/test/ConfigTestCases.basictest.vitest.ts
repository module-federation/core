// 清理残留的 Federation 全局状态，避免跨 case 互相影响
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

import { vi } from 'vitest';
import { describeCases } from './ConfigTestCases.vitest';

vi.resetModules();

describeCases({
  name: 'ConfigTestCases',
});
