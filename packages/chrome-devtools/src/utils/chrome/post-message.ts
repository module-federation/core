import type { FederationRuntimePlugin } from '@module-federation/runtime/types';

import { definePropertyGlobalVal } from '../sdk';

const getModuleInfo = (): FederationRuntimePlugin => {
  return {
    name: 'devtool-getModuleInfo-plugin',
    loadSnapshot({
      options,
      moduleInfo,
      hostGlobalSnapshot,
      remoteSnapshot,
      globalSnapshot,
    }) {
      if (options.inBrowser) {
        window.postMessage(
          {
            moduleInfo: globalSnapshot,
            updateModule: moduleInfo,
          },
          '*',
        );
      }
      return {
        options,
        moduleInfo,
        hostGlobalSnapshot,
        remoteSnapshot,
        globalSnapshot,
      };
    },
  };
};

if (!window?.__FEDERATION__) {
  definePropertyGlobalVal(window, '__FEDERATION__', {});
  definePropertyGlobalVal(window, '__VMOK__', window.__FEDERATION__);
}

if (!window?.__FEDERATION__.__GLOBAL_PLUGIN__) {
  window.__FEDERATION__.__GLOBAL_PLUGIN__ = [];
}

window.__FEDERATION__.__GLOBAL_PLUGIN__?.push(getModuleInfo());
