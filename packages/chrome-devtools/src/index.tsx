import { createRoot } from 'react-dom/client';
import { GlobalModuleInfo } from '@module-federation/sdk';

import App from './App';

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

(async () => {
  if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error
    await import('../mock');
  }
  const container = document.getElementById('root') as HTMLElement;
  const root = createRoot(container);
  root.render(<App />);
})();
