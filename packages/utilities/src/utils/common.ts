/* eslint-disable @typescript-eslint/ban-ts-comment */

import type {
  AsyncContainer,
  GetModuleOptions,
  RemoteData,
  Remotes,
  RuntimeRemote,
  WebpackRemoteContainer,
} from '../types';
import { loadScript } from './pure';

const createContainerSharingScope = (
  asyncContainer: AsyncContainer | undefined,
) => {
  // @ts-ignore
  return asyncContainer
    .then(function (container) {
      if (!__webpack_share_scopes__['default']) {
        // not always a promise, so we wrap it in a resolve
        return Promise.resolve(__webpack_init_sharing__('default')).then(
          function () {
            return container;
          },
        );
      } else {
        return container;
      }
    })
    .then(function (container) {
      try {
        // WARNING: here might be a potential BUG.
        //   `container.init` does not return a Promise, and here we do not call `then` on it.
        // But according to [docs](https://webpack.js.org/concepts/module-federation/#dynamic-remote-containers)
        //   it must be async.
        // The problem may be in Proxy in NextFederationPlugin.js.
        //   or maybe a bug in the webpack itself - instead of returning rejected promise it just throws an error.
        // But now everything works properly and we keep this code as is.
        container.init(__webpack_share_scopes__['default'] as any);
      } catch (e) {
        // maybe container already initialized so nothing to throw
      }
      return container;
    });
};

/**
 * Return initialized remote container by remote's key or its runtime remote item data.
 *
 * `runtimeRemoteItem` might be
 *    { global, url } - values obtained from webpack remotes option `global@url`
 * or
 *    { asyncContainer } - async container is a promise that resolves to the remote container
 */
export const injectScript = async (
  keyOrRuntimeRemoteItem: string | RuntimeRemote,
) => {
  const asyncContainer = loadScript(keyOrRuntimeRemoteItem);
  return createContainerSharingScope(asyncContainer);
};

/**
 * Creates runtime variables from the provided remotes.
 * If the value of a remote starts with 'promise ' or 'external ', it is transformed into a function that returns the promise call.
 * Otherwise, the value is stringified.
 * @param {Remotes} remotes - The remotes to create runtime variables from.
 * @returns {Record<string, string>} - The created runtime variables.
 */
export const createRuntimeVariables = (
  remotes: Remotes,
): Record<string, string> => {
  if (!remotes) {
    return {};
  }

  return Object.entries(remotes).reduce(
    (acc, [key, value]) => {
      if (value.startsWith('promise ') || value.startsWith('external ')) {
        const promiseCall = value.split(' ')[1];
        acc[key] = `function() {
        return ${promiseCall}
      }`;
      } else {
        acc[key] = JSON.stringify(value);
      }

      return acc;
    },
    {} as Record<string, string>,
  );
};

/**
 * Returns initialized webpack RemoteContainer.
 * If its' script does not loaded - then load & init it firstly.
 */
export const getContainer = async (
  remoteContainer: string | RemoteData,
): Promise<WebpackRemoteContainer | undefined> => {
  if (!remoteContainer) {
    throw Error(`Remote container options is empty`);
  }
  const containerScope =
    typeof window !== 'undefined'
      ? window
      : (globalThis as any).__remote_scope__;
  let containerKey: string;

  if (typeof remoteContainer === 'string') {
    containerKey = remoteContainer;
  } else {
    containerKey = remoteContainer.uniqueKey as string;
    if (!containerScope[containerKey]) {
      const container = await injectScript({
        global: remoteContainer.global,
        url: remoteContainer.url,
      });
      if (!container) {
        throw Error(`Remote container ${remoteContainer.url} is empty`);
      }
    }
  }

  return containerScope[containerKey];
};
/**
 * Return remote module from container.
 * If you provide `exportName` it automatically return exact property value from module.
 *
 * @example
 *   remote.getModule('./pages/index', 'default')
 */
export const getModule = async ({
  remoteContainer,
  modulePath,
  exportName,
}: GetModuleOptions) => {
  const container = await getContainer(remoteContainer);
  try {
    const modFactory = await container?.get(modulePath);
    if (!modFactory) {
      return undefined;
    }
    const mod = modFactory();
    if (exportName) {
      return mod && typeof mod === 'object' ? mod[exportName] : undefined;
    } else {
      return mod;
    }
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
