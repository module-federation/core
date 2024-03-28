import type { FederationRuntimePlugin } from '@module-federation/runtime/types';
import { loadScript } from '@module-federation/sdk';

import { isObject, getUnpkgUrl } from '../index';
import { definePropertyGlobalVal } from '../sdk';
import { __FEDERATION_DEVTOOLS__ } from '../../template';

const fastRefreshPlugin = (): FederationRuntimePlugin => {
  return {
    name: 'fast-refresh-plugin',
    // @ts-expect-error
    beforeInit({ origin, userOptions, options, shareInfo }) {
      let enableFastRefresh: boolean;
      let devtoolsMessage;

      const devtoolsMessageStr = localStorage.getItem(__FEDERATION_DEVTOOLS__);
      if (devtoolsMessageStr) {
        try {
          devtoolsMessage = JSON.parse(devtoolsMessageStr);
          enableFastRefresh = devtoolsMessage?.enableFastRefresh;
        } catch (e) {
          console.debug('Fast Refresh Plugin Error: ', e);
        }
      }

      if (isObject(shareInfo)) {
        let orderResolve: (value?: unknown) => void;
        const orderPromise = new Promise((resolve) => {
          orderResolve = resolve;
        });
        Object.keys(shareInfo).forEach(async (share) => {
          let get: () => any;
          if (share === 'react') {
            get = () =>
              loadScript(
                getUnpkgUrl(share, shareInfo[share].version) as string,
                {
                  attrs: { defer: true, async: false },
                },
              ).then(() => {
                orderResolve();
              });
          }
          if (share === 'react-dom') {
            get = () =>
              orderPromise.then(() =>
                loadScript(
                  getUnpkgUrl(share, shareInfo[share].version) as string,
                  {
                    attrs: { defer: true, async: false },
                  },
                ),
              );
          }
          // @ts-expect-error
          if (enableFastRefresh && typeof get === 'function') {
            if (share === 'react') {
              shareInfo[share].get = async () => {
                if (!window.React) {
                  await get();
                  console.warn(
                    '[Module Federation HMR]: You are using Module Federation Devtools to debug online host, it will cause your project load Dev mode React and ReactDOM. If not in this mode, please disable it in Module Federation Devtools',
                  );
                }
                shareInfo[share].lib = () => window.React;
                return () => window.React;
              };
            }
            if (share === 'react-dom') {
              shareInfo[share].get = async () => {
                if (!window.ReactDOM) {
                  await get();
                }
                shareInfo[share].lib = () => window.ReactDOM;
                return () => window.ReactDOM;
              };
            }
          }
        });

        return {
          origin,
          userOptions,
          options,
          shareInfo,
        };
      } else {
        return {
          origin,
          userOptions,
          options,
        };
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

window.__FEDERATION__.__GLOBAL_PLUGIN__?.push(fastRefreshPlugin());
