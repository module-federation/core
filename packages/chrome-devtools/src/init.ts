import { GlobalModuleInfo } from '@module-federation/sdk';

declare global {
  interface Window {
    targetTab: chrome.tabs.Tab;
    moduleHandler: (...args: Array<any>) => void;
  }
}

declare module '@module-federation/runtime' {
  export interface Federation {
    originModuleInfo: GlobalModuleInfo;
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
