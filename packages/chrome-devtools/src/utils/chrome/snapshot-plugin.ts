import { MODULE_DEVTOOL_IDENTIFIER } from '@module-federation/sdk';
import runtimeHelpers from '@module-federation/runtime/helpers';

import type { FederationRuntimePlugin } from '@module-federation/runtime/types';

import { definePropertyGlobalVal } from '../sdk';

declare global {
  // eslint-disable-next-line no-var, no-inner-declarations
  var __INIT_VMOK_CHROME_DEVTOOL_PLUGIN__: boolean | undefined;
}

const chromeDevtoolsPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'mf-chrome-devtools-inject-snapshot-plugin',
    beforeLoadRemoteSnapshot({ options }) {
      const { nativeGlobal } = runtimeHelpers.global;

      if (!options || options.inBrowser) {
        const realLocalStorage = nativeGlobal.localStorage || localStorage;
        const debugModuleInfoStr = realLocalStorage.getItem(
          MODULE_DEVTOOL_IDENTIFIER,
        );
        if (
          debugModuleInfoStr &&
          !nativeGlobal.__INIT_VMOK_CHROME_DEVTOOL_PLUGIN__
        ) {
          const chromeDevtoolSnapshot = JSON.parse(debugModuleInfoStr);
          if (chromeDevtoolSnapshot) {
            runtimeHelpers.global.addGlobalSnapshot(chromeDevtoolSnapshot);
            nativeGlobal.__INIT_VMOK_CHROME_DEVTOOL_PLUGIN__ = true;
            console.warn(
              '[Module Federation Devtools]: You are using the chrome devtool to proxy online module',
            );
          }
        }
      }
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

window.__FEDERATION__.__GLOBAL_PLUGIN__?.push(chromeDevtoolsPlugin());
