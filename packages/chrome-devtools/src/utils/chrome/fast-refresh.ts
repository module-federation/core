import type { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import { loadScript } from '@module-federation/sdk';

import { getUnpkgUrl } from '../index';
import { definePropertyGlobalVal } from '../sdk';
import {
  __FEDERATION_DEVTOOLS__,
  __EAGER_SHARE__,
  __ENABLE_FAST_REFRESH__,
} from '../../template/constant';

const SUPPORT_PKGS = ['react', 'react-dom'];
type BeforeRegisterShareArgs = Parameters<
  NonNullable<ModuleFederationRuntimePlugin['beforeRegisterShare']>
>[0];

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
  const [, version] = devtoolsMessage[__EAGER_SHARE__] as [string, string];
  fetchAndExecuteUmdSync(getUnpkgUrl('react', version) as string);
  fetchAndExecuteUmdSync(getUnpkgUrl('react-dom', version) as string);
}

const fastRefreshPlugin = (): ModuleFederationRuntimePlugin => {
  let orderResolve: (value?: unknown) => void;
  const orderPromise = new Promise((resolve) => {
    orderResolve = resolve;
  });

  return {
    name: 'mf-fast-refresh-plugin',
    beforeRegisterShare(args: BeforeRegisterShareArgs) {
      const { pkgName, shared } = args;
      if (!SUPPORT_PKGS.includes(pkgName)) {
        return args;
      }

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
        return args;
      }

      if (shared.shareConfig?.eager) {
        if (!devtoolsMessage?.[__EAGER_SHARE__]) {
          const eagerShare: string[] = [];
          eagerShare.push(pkgName, shared.version);
          devtoolsMessage[__EAGER_SHARE__] = eagerShare;
          localStorage.setItem(
            __FEDERATION_DEVTOOLS__,
            JSON.stringify(devtoolsMessage),
          );
          window.location.reload();
        }
        if (pkgName === 'react-dom') {
          shared.lib = () => window.ReactDOM;
        }
        if (pkgName === 'react') {
          shared.lib = () => window.React;
        }
        return args;
      }

      let get: (() => any) | undefined;
      if (pkgName === 'react') {
        get = () =>
          loadScript(getUnpkgUrl(pkgName, shared.version) as string, {
            attrs: {
              defer: false,
              async: false,
              'data-mf-injected': 'true',
            },
          }).then(() => {
            orderResolve();
          });
      }
      if (pkgName === 'react-dom') {
        get = () =>
          orderPromise.then(() =>
            loadScript(getUnpkgUrl(pkgName, shared.version) as string, {
              attrs: { defer: true, async: false },
            }),
          );
      }

      if (typeof get === 'function') {
        const finalGet = get;
        if (pkgName === 'react') {
          shared.get = async () => {
            if (!window.React) {
              await finalGet();
              console.warn(
                '[Module Federation HMR]: You are using Module Federation Devtools to debug online host, it will cause your project load Dev mode React and ReactDOM. If not in this mode, please disable it in Module Federation Devtools',
              );
            }
            shared.lib = () => window.React;
            return () => window.React;
          };
        }
        if (pkgName === 'react-dom') {
          shared.get = async () => {
            if (!window.ReactDOM) {
              await finalGet();
            }
            shared.lib = () => window.ReactDOM;
            return () => window.ReactDOM;
          };
        }
      }

      return args;
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
