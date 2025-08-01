import helpers from '@module-federation/runtime/helpers';
import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';

import { definePropertyGlobalVal } from '../sdk';

const getModuleInfo = (): ModuleFederationRuntimePlugin => {
  return {
    name: 'mf-devtool-getModuleInfo-plugin',
    loadRemoteSnapshot({ options, moduleInfo, remoteSnapshot, ...res }: any) {
      const globalSnapshot = helpers.global.getGlobalSnapshot();
      if (!options || options.inBrowser) {
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
        remoteSnapshot,
        ...res,
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
