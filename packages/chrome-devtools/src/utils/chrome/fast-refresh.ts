import type {
  FederationRuntimePlugin,
  Shared,
} from '@module-federation/runtime/types';
import { loadScript } from '@module-federation/sdk';

import { isObject, getUnpkgUrl } from '../index';
import { definePropertyGlobalVal } from '../sdk';
import { __FEDERATION_DEVTOOLS__ } from '../../template';

const fastRefreshPlugin = (): FederationRuntimePlugin => {
  return {
    name: 'mf-fast-refresh-plugin',
    beforeInit({ userOptions, ...args }) {
      const shareInfo = userOptions.shared;
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

      if (shareInfo && isObject(shareInfo)) {
        let orderResolve: (value?: unknown) => void;
        const orderPromise = new Promise((resolve) => {
          orderResolve = resolve;
        });
        Object.keys(shareInfo).forEach(async (share) => {
          // @ts-expect-error legacy runtime shareInfo[share] is shared , and latest i shard[]
          const sharedArr: Shared[] = Array.isArray(shareInfo[share])
            ? shareInfo[share]
            : [shareInfo[share]];

          sharedArr.forEach((shared) => {
            let get: () => any;
            if (share === 'react') {
              get = () =>
                loadScript(getUnpkgUrl(share, shared.version) as string, {
                  attrs: { defer: true, async: false },
                }).then(() => {
                  orderResolve();
                });
            }
            if (share === 'react-dom') {
              get = () =>
                orderPromise.then(() =>
                  loadScript(getUnpkgUrl(share, shared.version) as string, {
                    attrs: { defer: true, async: false },
                  }),
                );
            }
            // @ts-expect-error
            if (enableFastRefresh && typeof get === 'function') {
              if (share === 'react') {
                shared.get = async () => {
                  if (!window.React) {
                    await get();
                    console.warn(
                      '[Module Federation HMR]: You are using Module Federation Devtools to debug online host, it will cause your project load Dev mode React and ReactDOM. If not in this mode, please disable it in Module Federation Devtools',
                    );
                  }
                  shared.lib = () => window.React;
                  return () => window.React;
                };
              }
              if (share === 'react-dom') {
                shared.get = async () => {
                  if (!window.ReactDOM) {
                    await get();
                  }
                  shared.lib = () => window.ReactDOM;
                  return () => window.ReactDOM;
                };
              }
            }
          });
        });

        return {
          userOptions,
          ...args,
        };
      } else {
        return {
          userOptions,
          ...args,
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
