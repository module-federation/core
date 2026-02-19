import {
  AsyncContainer,
  RemoteVars,
  RuntimeRemote,
  RuntimeRemotesMap,
  WebpackRemoteContainer,
} from '../types';

const pure = typeof process !== 'undefined' ? process.env['REMOTES'] || {} : {};
export const remoteVars = pure as RemoteVars;

export const extractUrlAndGlobal = (urlAndGlobal: string): [string, string] => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};

export const loadScript = (keyOrRuntimeRemoteItem: string | RuntimeRemote) => {
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
    const remoteGlobal = reference.global as unknown as string;

    // Check if theres an override for container key if not use remote global
    const containerKey = reference.uniqueKey
      ? (reference.uniqueKey as unknown as string)
      : remoteGlobal;

    const __webpack_error__ = new Error() as Error & {
      type: string;
      request: string | null;
    };

    // @ts-ignore
    const globalScope =
      // @ts-ignore
      typeof window !== 'undefined' ? window : globalThis.__remote_scope__;

    if (typeof window === 'undefined') {
      //@ts-ignore
      globalScope['_config'][containerKey] = reference.url;
    } else {
      // to match promise template system, can be removed once promise template is gone
      //@ts-ignore
      if (!globalScope['remoteLoading']) {
        //@ts-ignore
        globalScope['remoteLoading'] = {};
      }
      //@ts-ignore
      if (globalScope['remoteLoading'][containerKey]) {
        //@ts-ignore
        return globalScope['remoteLoading'][containerKey];
      }
    }
    // @ts-ignore
    asyncContainer = new Promise(function (resolve, reject) {
      function resolveRemoteGlobal() {
        //@ts-ignore
        const asyncContainer = globalScope[
          remoteGlobal
        ] as unknown as AsyncContainer;
        return resolve(asyncContainer);
      }
      //@ts-ignore
      if (typeof globalScope[remoteGlobal] !== 'undefined') {
        return resolveRemoteGlobal();
      }

      (__webpack_require__ as any).l(
        reference.url,
        function (event: Event) {
          //@ts-ignore
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
        containerKey,
      );
    }).catch(function (err) {
      console.error('container is offline, returning fake remote');
      console.error(err);

      return {
        fake: true,
        // @ts-ignore
        get: (arg) => {
          console.warn('faking', arg, 'module on, its offline');

          return Promise.resolve(() => {
            return {
              __esModule: true,
              default: () => {
                return null;
              },
            };
          });
        },
        //eslint-disable-next-line
        init: () => {},
      };
    });
    if (typeof window !== 'undefined') {
      //@ts-ignore
      globalScope['remoteLoading'][containerKey] = asyncContainer;
    }
  }

  return asyncContainer;
};

export const getRuntimeRemotes = () => {
  return Object.entries(remoteVars).reduce((acc, [key, value]) => {
    if (typeof value === 'object' && typeof value.then === 'function') {
      acc[key] = { asyncContainer: value };
    } else if (typeof value === 'function') {
      acc[key] = { asyncContainer: Promise.resolve(value()) };
    } else if (typeof value === 'string') {
      if (value.startsWith('internal ')) {
        const [request, query] = value.replace('internal ', '').split('?');
        if (query) {
          const remoteSyntax = new URLSearchParams(query).get('remote');
          if (remoteSyntax) {
            const [url, global] = extractUrlAndGlobal(remoteSyntax);
            acc[key] = { global, url };
          }
        }
      } else {
        const [url, global] = extractUrlAndGlobal(value);
        acc[key] = { global, url };
      }
    } else {
      console.warn('remotes process', process.env['REMOTES']);
      throw new Error(
        `[mf] Invalid value received for runtime_remote "${key}"`,
      );
    }
    return acc;
  }, {} as RuntimeRemotesMap);
};
