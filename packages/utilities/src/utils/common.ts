/* eslint-disable @typescript-eslint/ban-ts-comment */

import type {
  AsyncContainer,
  Remotes,
  RuntimeRemotesMap,
  RuntimeRemote,
  WebpackRemoteContainer,
  RemoteData,
  GetModuleOptions
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

    const globalScope =
      //@ts-ignore
      typeof window !== 'undefined' ? window : global.__remote_scope__; // TODO: fix types

    asyncContainer = new Promise(function (resolve, reject) {
      function resolveRemoteGlobal() {
        const asyncContainer = globalScope[
          remoteGlobal
        ] as unknown as AsyncContainer;
        return resolve(asyncContainer);
      }

      if (typeof globalScope[remoteGlobal] !== 'undefined') {
        return resolveRemoteGlobal();
      }

      (__webpack_require__ as any).l(
        reference.url,
        function (event: Event) {
          if (typeof globalScope[remoteGlobal] !== 'undefined') {
            return resolveRemoteGlobal();
          }

          const errorType =
            event && (event.type === 'load' ? 'missing' : event.type);
          const realSrc =
            event && event.target && (event.target as HTMLScriptElement).src;

          __webpack_error__.message =
            'Loading script failed.\n(' +
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

  // 2) Initialize remote container
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
export const getContainer = async (remoteContainer: string | RemoteData) : Promise<WebpackRemoteContainer|undefined> => {

  if(!remoteContainer) {
    throw Error(`Remote container options is empty`);
  }
  if(typeof remoteContainer === 'string') {
    if (window[remoteContainer]) {
      return window[remoteContainer];
    }
  } else {
    if (window['uniqueKey' as keyof typeof  remoteContainer]) {
      return window['uniqueKey' as keyof typeof  remoteContainer];
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
}

  /**
  * Return remote module from container.
  * If you provide `exportName` it automatically return exact property value from module.
  *
  * @example
  *   remote.getModule('./pages/index', 'default')
  */
export const getModule = async ({ remoteContainer, modulePath, exportName }: GetModuleOptions) => {
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
} catch(error) {
  console.log(error)
  return undefined
}
}