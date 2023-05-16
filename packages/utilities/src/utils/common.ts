/* eslint-disable @typescript-eslint/ban-ts-comment */

import type {
  AsyncContainer,
  GetModuleOptions,
  RemoteData,
  Remotes,
  RuntimeRemote,
  WebpackRemoteContainer,
} from '../types';
import { getRuntimeRemotes } from './getRuntimeRemotes';
import { RemoteVars } from '../types';
let remotesFromProcess = {} as RemoteVars;
try {
  // @ts-ignore
  remotesFromProcess = process.env['REMOTES'] || {};
} catch (e) {
  // not in webpack bundle
}
export const remoteVars = remotesFromProcess as RemoteVars;
// split the @ syntax into url and global
export const extractUrlAndGlobal = (urlAndGlobal: string): [string, string] => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};

export const importDelegatedModule = async (
  keyOrRuntimeRemoteItem: string | RuntimeRemote
) => {
  // @ts-ignore
  return loadScript(keyOrRuntimeRemoteItem)
    .then((asyncContainer: WebpackRemoteContainer) => {
      return asyncContainer;
    })
    .then((asyncContainer: WebpackRemoteContainer) => {
      // most of this is only needed because of legacy promise based implementation
      // can remove proxies once we remove promise based implementations
      if (typeof window === 'undefined') {
        if (!Object.hasOwnProperty.call(keyOrRuntimeRemoteItem, 'global')) {
          return asyncContainer;
        }

        // return asyncContainer;

        //TODO: need to solve chunk flushing with delegated modules
        return {
          get: function (arg: string) {
            //@ts-ignore
            return asyncContainer.get(arg).then((f) => {
              const m = f();
              const result = {
                __esModule: m.__esModule,
              };
              for (const prop in m) {
                if (typeof m[prop] === 'function') {
                  Object.defineProperty(result, prop, {
                    get: function () {
                      return function () {
                        //@ts-ignore
                        if (global.usedChunks)
                          //@ts-ignore
                          global.usedChunks.add(
                            //@ts-ignore
                            `${keyOrRuntimeRemoteItem.global}->${arg}`
                          );
                        // eslint-disable-next-line prefer-rest-params
                        return m[prop](arguments);
                      };
                    },
                    enumerable: true,
                  });
                } else {
                  Object.defineProperty(result, prop, {
                    get: () => {
                      //@ts-ignore
                      if (global.usedChunks)
                        //@ts-ignore
                        global.usedChunks.add(
                          //@ts-ignore
                          `${keyOrRuntimeRemoteItem.global}->${arg}`
                        );

                      return m[prop];
                    },
                    enumerable: true,
                  });
                }
              }

              if (m.then) {
                return Promise.resolve(() => result);
              }

              return () => result;
            });
          },
          init: asyncContainer.init,
        };
      } else {
        return asyncContainer;
      }
    });
};

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
  return `internal ${delegate}?${queries.join('&')}`;
};

export const loadScript = async (
  keyOrRuntimeRemoteItem: string | RuntimeRemote
) => {
  const runtimeRemotes = getRuntimeRemotes();

  let reference =
    typeof keyOrRuntimeRemoteItem === 'string'
      ? runtimeRemotes[keyOrRuntimeRemoteItem]
      : keyOrRuntimeRemoteItem;

  let asyncContainer = reference.asyncContainer;

  if (!asyncContainer) {
    const remoteGlobal = reference.global as unknown as string;
    const containerKey = reference.uniqueKey
      ? (reference.uniqueKey as unknown as string)
      : remoteGlobal;

    const globalScope =
      typeof window !== 'undefined' ? window : global.__remote_scope__ || {};

    if (typeof window === 'undefined') {
      globalScope['_config'] = globalScope['_config'] || {};
      globalScope['_config'][containerKey] = reference.url;
    } else {
      globalScope['remoteLoading'] = globalScope['remoteLoading'] || {};
      if (globalScope['remoteLoading'][containerKey]) {
        return globalScope['remoteLoading'][containerKey];
      }
    }
    // @ts-ignore
    asyncContainer = loadRemoteContainer(
      globalScope,
      remoteGlobal,
      //@ts-ignore
      reference.url,
      containerKey
    );
    if (typeof window !== 'undefined') {
      globalScope['remoteLoading'][containerKey] = asyncContainer;
    }
  }

  try {
    const container = await asyncContainer;
    return container;
  } catch (error) {
    console.error(`Failed to load script: ${error}`);
    return {
      fake: true,
      init: () => {},
      get: () => {
        const factory = () => {
          return {
            __esModule: true,
            default: () => null,
          };
        };
        return Promise.resolve(factory);
      },
    };
  }
};

function loadRemoteContainer(
  globalScope: any,
  remoteGlobal: string,
  url: string,
  containerKey: string
) {
  return new Promise((resolve, reject) => {
    (__webpack_require__ as any).l(
      url,
      (event: Event) => {
        if (globalScope[remoteGlobal]) {
          return resolve(
            globalScope[remoteGlobal] as unknown as AsyncContainer
          );
        }

        const errorType =
          event && (event.type === 'load' ? 'missing' : event.type);
        const realSrc =
          event && event.target && (event.target as HTMLScriptElement).src;
        const error = new Error(
          `Loading script failed.\n(${errorType}: ${realSrc} or global var ${remoteGlobal})`
        );
        error.name = 'ScriptExternalLoadError';

        reject(error);
      },
      containerKey
    );
  });
}

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
    typeof window !== 'undefined' ? window : global.__remote_scope__;

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
    console.log(error);
    return undefined;
  }
};
