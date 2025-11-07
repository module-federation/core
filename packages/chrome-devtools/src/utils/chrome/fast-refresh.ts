import type {
  ModuleFederationRuntimePlugin,
  Shared,
} from '@module-federation/runtime/types';
import { loadScript, createScript } from '@module-federation/sdk';

import { isObject, getUnpkgUrl } from '../index';
import { definePropertyGlobalVal } from '../sdk';
import {
  __FEDERATION_DEVTOOLS__,
  __EAGER_SHARE__,
  __ENABLE_FAST_REFRESH__,
} from '../../template/constant';

const SUPPORT_PKGS = ['react', 'react-dom'];

/**
 * Fetch and execute a UMD module synchronously
 * @param url - URL of the UMD module to load
 * @returns The module exports
 */
const fetchAndExecuteUmdSync = (url: string): any => {
  try {
    const response = new XMLHttpRequest();
    response.open('GET', url, false);
    response.overrideMimeType('text/plain');
    response.send();

    if (response.status === 200) {
      const scriptContent = response.responseText;

      // Create a new Function constructor to execute the script synchronously
      const moduleFunction = new Function(scriptContent);

      // Execute the function and return the module exports
      return moduleFunction(window);
    } else {
      throw new Error(
        `Failed to load module from ${url}: HTTP ${response.status}`,
      );
    }
  } catch (error: any) {
    throw new Error(`Failed to fetch module from ${url}: ${error.message}`);
  }
};

const getDevtoolsMessage = () => {
  const devtoolsMessageStr = localStorage.getItem(__FEDERATION_DEVTOOLS__);
  if (devtoolsMessageStr) {
    try {
      return JSON.parse(devtoolsMessageStr);
    } catch (e) {
      console.debug('Fast Refresh Plugin Error: ', e);
    }
  }
  return null;
};

const devtoolsMessage = getDevtoolsMessage();
if (
  devtoolsMessage?.[__ENABLE_FAST_REFRESH__] &&
  devtoolsMessage?.[__EAGER_SHARE__]
) {
  // eagerShare is [react, 19.0.0]
  const [_name, version] = devtoolsMessage[__EAGER_SHARE__] as [string, string];
  fetchAndExecuteUmdSync(getUnpkgUrl('react', version) as string);
  fetchAndExecuteUmdSync(getUnpkgUrl('react-dom', version) as string);
}

const fastRefreshPlugin = (): ModuleFederationRuntimePlugin => {
  return {
    name: 'mf-fast-refresh-plugin',
    beforeInit({ userOptions, ...args }) {
      const shareInfo = userOptions.shared;
      const twinsShareInfo = args.shareInfo;
      let enableFastRefresh = false;
      let devtoolsMessage: Record<string, unknown> = {};

      const devtoolsMessageStr = localStorage.getItem(__FEDERATION_DEVTOOLS__);
      if (devtoolsMessageStr) {
        try {
          devtoolsMessage = JSON.parse(devtoolsMessageStr);
          enableFastRefresh = devtoolsMessage?.[
            __ENABLE_FAST_REFRESH__
          ] as boolean;
        } catch (e) {
          console.debug('Fast Refresh Plugin Error: ', e);
        }
      }

      if (!enableFastRefresh) {
        return {
          userOptions,
          ...args,
        };
      }

      if (shareInfo && isObject(shareInfo)) {
        let orderResolve: (value?: unknown) => void;
        const orderPromise = new Promise((resolve) => {
          orderResolve = resolve;
        });
        Object.keys(shareInfo).forEach(async (share) => {
          // @ts-ignore legacy runtime shareInfo[share] is shared , and latest i shard[]
          const sharedArr: Shared[] = Array.isArray(shareInfo[share])
            ? shareInfo[share]
            : [shareInfo[share]];

          let twinsSharedArr: Shared[];
          if (twinsShareInfo) {
            // @ts-ignore
            twinsSharedArr = Array.isArray(twinsShareInfo[share])
              ? twinsShareInfo[share]
              : [twinsShareInfo[share]];
          }

          sharedArr.forEach((shared, idx) => {
            if (!SUPPORT_PKGS.includes(share)) {
              return;
            }
            if (shared.shareConfig?.eager) {
              if (!devtoolsMessage?.[__EAGER_SHARE__]) {
                const eagerShare: string[] = [];
                eagerShare.push(share, shared.version);
                devtoolsMessage[__EAGER_SHARE__] = eagerShare;
                localStorage.setItem(
                  __FEDERATION_DEVTOOLS__,
                  JSON.stringify(devtoolsMessage),
                );
                window.location.reload();
              }
              if (share === 'react-dom') {
                shared.lib = () => window.ReactDOM;
              }
              if (share === 'react') {
                shared.lib = () => window.React;
              }
              return;
            }
            let get: () => any;
            if (share === 'react') {
              get = () =>
                loadScript(getUnpkgUrl(share, shared.version) as string, {
                  attrs: {
                    defer: false,
                    async: false,
                    'data-mf-injected': 'true',
                  },
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
            if (typeof get === 'function') {
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
              if (twinsShareInfo) {
                twinsSharedArr[idx].get = shared.get;
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
