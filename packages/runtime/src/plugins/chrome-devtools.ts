import { MODULE_DEVTOOL_IDENTIFIER } from '@module-federation/sdk';

import { FederationRuntimePlugin } from '../index';
import runtimeHelpers from '../helpers';

declare global {
  // eslint-disable-next-line no-var
  var __INIT_VMOK_CHROME_DEVTOOL_PLUGIN__: boolean | undefined;
}

const chromeDevtoolsPlugin: () => FederationRuntimePlugin = function () {
  return {
    name: 'chrome-devtool',
    beforeLoadRemoteSnapshot({ moduleInfo, options, ...info }) {
      const { nativeGlobal } = runtimeHelpers.global;

      if (options.inBrowser) {
        const realLocalStorage = nativeGlobal.localStorage || localStorage;
        const debugModuleInfoStr = realLocalStorage.getItem(
          MODULE_DEVTOOL_IDENTIFIER,
        );
        if (
          debugModuleInfoStr &&
          !nativeGlobal.__INIT_VMOK_CHROME_DEVTOOL_PLUGIN__ &&
          !options?.id?.endsWith(':local')
        ) {
          const chromeDevtoolSnapshot = JSON.parse(debugModuleInfoStr);
          if (chromeDevtoolSnapshot) {
            runtimeHelpers.global.addGlobalSnapshot(chromeDevtoolSnapshot);
            nativeGlobal.__INIT_VMOK_CHROME_DEVTOOL_PLUGIN__ = true;
          }
        }
      }
    },
  };
};

export default chromeDevtoolsPlugin;
