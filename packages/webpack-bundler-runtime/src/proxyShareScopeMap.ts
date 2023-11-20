import { WebpackRequire } from './types';

export function proxyShareScopeMap(__webpack_require__: WebpackRequire) {
  if (!__webpack_require__.S) {
    return;
  }
  // @ts-ignore FIXME: ideal situation is import type from @module-federation/runtime/type ,but the compile will throw error
  __webpack_require__.S = new Proxy(globalThis.__VMOK__.__SHARE__, {
    get(target, prop: string, receiver) {
      return globalThis.__VMOK__.__SHARE__[prop];
    },
    set(target, prop: string, value) {
      globalThis.__VMOK__.__SHARE__[prop] = value;
      return true;
    },
  });
}
