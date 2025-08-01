import { GlobalModuleInfo } from '@module-federation/sdk';

declare global {
  interface Window {
    targetTab: chrome.tabs.Tab;
    moduleHandler: (...args: Array<any>) => void;
  }
}

import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

declare module '@module-federation/runtime' {
  export interface Federation {
    originModuleInfo: GlobalModuleInfo;
    __GLOBAL_PLUGIN__: Array<ModuleFederationRuntimePlugin>;
  }
}

if (process.env.NODE_ENV === 'development') {
  const createProxy = (): any =>
    new Proxy(() => Promise.resolve({}), {
      get: () => {
        return createProxy();
      },
    });
  window.chrome = createProxy();
}
