/* eslint-disable @typescript-eslint/ban-ts-comment */

import type {
  AsyncContainer,
  Remotes,
  RuntimeRemotesMap,
  RuntimeRemote,
  WebpackRemoteContainer,
} from '../types';

type RemoteVars = Record<
  string,
  | Promise<WebpackRemoteContainer>
  | string
  | (() => Promise<WebpackRemoteContainer>)
>;

// split the @ syntax into url and global
export const extractUrlAndGlobal = (urlAndGlobal: string): [string, string] => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};

const getRuntimeRemotes = () => {
  try {
    //@ts-ignore
    const remoteVars = (process.env.REMOTES || {}) as RemoteVars;

    const runtimeRemotes = Object.entries(remoteVars).reduce(function (
      acc,
      item
    ) {
      const [key, value] = item;
      // if its an object with a thenable (eagerly executing function)
      if (typeof value === 'object' && typeof value.then === 'function') {
        acc[key] = { asyncContainer: value };
      }
      // if its a function that must be called (lazily executing function)
      else if (typeof value === 'function') {
        // @ts-ignore
        acc[key] = { asyncContainer: value };
      }
      // if its just a string (global@url)
      else if (typeof value === 'string') {
        const [url, global] = extractUrlAndGlobal(value);
        acc[key] = { global, url };
      }
      // we dont know or currently support this type
      else {
        //@ts-ignore
        console.log('remotes process', process.env.REMOTES);
        throw new Error(
          `[mf] Invalid value received for runtime_remote "${key}"`
        );
      }
      return acc;
    },
    {} as RuntimeRemotesMap);

    return runtimeRemotes;
  } catch (err) {
    console.warn('Unable to retrieve runtime remotes: ', err);
  }

  return {} as RuntimeRemotesMap;
};

export const importDelegatedModule = async (
  keyOrRuntimeRemoteItem: string | RuntimeRemote
) => {
  // @ts-ignore
  return loadScript(keyOrRuntimeRemoteItem).then((asyncContainer) => {
    // for legacy reasons, we must mark container a initialized
    // here otherwise older promise based implementation will try to init again with diff object
    // asyncContainer.__initialized = true;
    return asyncContainer
  }).then((asyncContainer) => {
    // most of this is only needed because of legacy promise based implementation
    if(typeof window === 'undefined') {
      const proxy = {
        get: asyncContainer.get,
        init: function (shareScope: any, initScope: any) {
          const handler = {
            get: async (target: { [x: string]: any; }, prop: string | number) => {
              // if (target[prop]) {
              //   Object.values(target[prop]).forEach(function (o) {
              //     if (o.from === '_N_E') {
              //       o.loaded = 1
              //     }
              //   })
              // }
              return target[prop]
            },
            set(target: { [x: string]: any; }, property: string, value: any) {
              //@ts-ignore
              if (global.usedChunks) global.usedChunks.add(global + "->" + property);
              if (target[property]) {
                return target[property]
              }
              target[property] = value
              return true
            }
          }
          try {
            // @ts-ignore
            return asyncContainer.init(new Proxy(shareScope, handler), initScope)
          } catch (e) {
          }
          asyncContainer.__initialized = true
        }
      }
     return proxy
    } else {
      console.log('returning delegate module', keyOrRuntimeRemoteItem)
      return {
        get: asyncContainer.get,
        init: function (shareScope: any, initScope: any) {
          console.log('init', shareScope, initScope)

          try {
            // @ts-ignore
            return asyncContainer.init(shareScope, initScope);
          } catch (e) {
          }
          asyncContainer.__initialized = true;
        }
      }
    }
  });
};

export const createDelegatedModule = (delegate:string, params: { [key: string]: any } ) => {
  let queries: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    queries.push(`${key}=${value}`);
  }
  return `internal ${delegate}?${queries.join('&')}`;
}

const loadScript = (keyOrRuntimeRemoteItem: string | RuntimeRemote) => {
  const runtimeRemotes = getRuntimeRemotes();

  // 1) Load remote container if needed
  let asyncContainer: RuntimeRemote['asyncContainer'];
  const reference =
    typeof keyOrRuntimeRemoteItem === 'string'
      ? runtimeRemotes[keyOrRuntimeRemoteItem]
      : keyOrRuntimeRemoteItem;

  if (reference.asyncContainer) {
    asyncContainer =
      typeof reference.asyncContainer.then === 'function'
        ? reference.asyncContainer
        : // @ts-ignore
          reference.asyncContainer();
  } else {
    // This casting is just to satisfy typescript,
    // In reality remoteGlobal will always be a string;
    const remoteGlobal = reference.global as unknown as number;

    // Check if theres an override for container key if not use remote global
    const containerKey = reference.uniqueKey
      ? (reference.uniqueKey as unknown as number)
      : remoteGlobal;

    const __webpack_error__ = new Error() as Error & {
      type: string;
      request: string | null;
    };

    //@ts-ignore
    if (!global.__remote_scope__) {
      // create a global scope for container, similar to how remotes are set on window in the browser
      //@ts-ignore
      global.__remote_scope__ = {
        _config: {},
      };
    }

    const globalScope =
      //@ts-ignore
      typeof window !== 'undefined' ? window : global.__remote_scope__; // TODO: fix types

    if (typeof window === 'undefined') {
      //@ts-ignore
      globalScope._config[global] = reference.url;
    }

    asyncContainer = new Promise(function (resolve, reject) {
      function resolveRemoteGlobal() {
        const asyncContainer = globalScope[
          remoteGlobal
        ] as unknown as AsyncContainer;
        globalScope[remoteGlobal].__initialized = true;
        return resolve(asyncContainer);
      }

      (__webpack_require__ as any).l(
        reference.url,
        function (event: Event) {
          console.log("event",event)
          if (typeof globalScope[remoteGlobal] !== 'undefined') {
            globalScope[remoteGlobal].__initialized = true;
            return resolveRemoteGlobal();
          }

          const errorType =
            event && (event.type === 'load' ? 'missing' : event.type);
          const realSrc =
            event && event.target && (event.target as HTMLScriptElement).src;

          __webpack_error__.message =
            'common Loading script failed.\n(' +
            errorType +
            ': ' +
            realSrc +
            ' or global var ' +
            remoteGlobal +
            ')';

          __webpack_error__.name = 'ScriptExternalLoadError';
          __webpack_error__.type = errorType;
          __webpack_error__.request = realSrc;

          reject(__webpack_error__);
        },
        containerKey
      );
    });
  }

  return asyncContainer;
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
