/* eslint-disable @typescript-eslint/ban-ts-comment */

import type {
  AsyncContainer,
  GetModuleOptions,
  RemoteData,
  Remotes,
  RuntimeRemote,
  WebpackRemoteContainer,
} from '../types';

import * as utils from './pure';

export const remoteVars = utils.remoteVars;
export const extractUrlAndGlobal = utils.extractUrlAndGlobal;
export const loadScript = utils.loadScript;
export const getRuntimeRemotes = utils.getRuntimeRemotes;

export const createDelegatedModule = (
  delegate: string,
  params: { [key: string]: any }
) => {
  const queries: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value) || typeof value === 'object') {
      throw new Error(
        `[Module Federation] Delegated module params cannot be an array or object. Key "${key}" should be a string or number`
      );
    }
    queries.push(`${key}=${value}`);
  }
  if (queries.length === 0) return `internal ${delegate}`;
  return `internal ${delegate}?${queries.join('&')}`;
};

const createContainerSharingScope = (
  asyncContainer: AsyncContainer | undefined
) => {
  // @ts-ignore
  return asyncContainer
    .then(function (container) {
      if (!__webpack_share_scopes__['default']) {
        // not always a promise, so we wrap it in a resolve
        return Promise.resolve(__webpack_init_sharing__('default')).then(
          function () {
            return container;
          }
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
export const injectScript = (
  keyOrRuntimeRemoteItem: string | RuntimeRemote
) => {
  const asyncContainer = loadScript(keyOrRuntimeRemoteItem);
  return createContainerSharingScope(asyncContainer);
};

export const createRuntimeVariables = (remotes: Remotes) => {
  if (!remotes) {
    return {};
  }

  return Object.entries(remotes).reduce((acc, remote) => {
    // handle promise new promise and external new promise
    if (remote[1].startsWith('promise ') || remote[1].startsWith('external ')) {
      const promiseCall = remote[1]
        .replace('promise ', '')
        .replace('external ', '');
      acc[remote[0]] = `function() {
        return ${promiseCall}
      }`;
      return acc;
    }
    // if somehow its just the @ syntax or something else, pass it through
    acc[remote[0]] = JSON.stringify(remote[1]);

    return acc;
  }, {} as Record<string, string>);
};

/**
 * Returns initialized webpack RemoteContainer.
 * If its' script does not loaded - then load & init it firstly.
 */
export const getContainer = async (
  remoteContainer: string | RemoteData
): Promise<WebpackRemoteContainer | undefined> => {
  if (!remoteContainer) {
    throw Error(`Remote container options is empty`);
  }
  // @ts-ignore
  const containerScope =
    // @ts-ignore
    typeof window !== 'undefined' ? window : globalThis.__remote_scope__;

  if (typeof remoteContainer === 'string') {
    if (containerScope[remoteContainer]) {
      return containerScope[remoteContainer];
    }

    return;
  } else {
    const uniqueKey = remoteContainer.uniqueKey as string;
    if (containerScope[uniqueKey]) {
      return containerScope[uniqueKey];
    }

    const container = await injectScript({
      global: remoteContainer.global,
      url: remoteContainer.url,
    });

    if (container) {
      return container;
    }

    throw Error(`Remote container ${remoteContainer.url} is empty`);
  }
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
    if (!modFactory) return undefined;
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
