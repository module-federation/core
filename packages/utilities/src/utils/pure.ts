import {
  AsyncContainer,
  RemoteVars,
  RuntimeRemote,
  RuntimeRemotesMap,
  GlobalScopeType
} from '../types/index';



let pure: RemoteVars = {};
try {
  // @ts-ignore
  pure = process.env['REMOTES'] || {};
} catch (e) {
  // not in webpack bundle
}
export const remoteVars: RemoteVars = pure;

export const extractUrlAndGlobal = (urlAndGlobal: string): [string, string] => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};

export const loadScript = (keyOrRuntimeRemoteItem: string | RuntimeRemote): Promise<AsyncContainer> => {
  const runtimeRemotes: RuntimeRemotesMap = getRuntimeRemotes();

  // 1) Load remote container if needed
  let asyncContainer: Promise<AsyncContainer>;
  const reference: RuntimeRemote =
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
    const remoteGlobal: string = reference.global as unknown as string;

    // Check if theres an override for container key if not use remote global
    const containerKey: string = reference.uniqueKey
      ? (reference.uniqueKey as unknown as string)
      : remoteGlobal;

    const __webpack_error__: Error & {
      type: string;
      request: string | null;
    } = new Error() as Error & {
      type: string;
      request: string | null;
    };

    // @ts-ignore
    if (!globalThis.__remote_scope__) {
      // create a global scope for container, similar to how remotes are set on window in the browser
      // @ts-ignore
      globalThis.__remote_scope__ = {
        // @ts-ignore
        _config: {},
      };
    }

    let globalScope: GlobalScopeType;

    if (typeof window !== 'undefined') {
      // If window doesn't have a _config property, add it
      globalScope = window as unknown as GlobalScopeType;
    } else {
      globalScope = globalThis.__remote_scope__;
    }

    if (typeof window === 'undefined') {
      //@ts-ignore
      globalScope['_config'][containerKey] = reference.url;
    } else {
      // to match promise template system, can be removed once promise template is gone
      if (!globalScope['remoteLoading']) {
        globalScope['remoteLoading'] = {};
      }
      // @ts-ignore
      if (globalScope['remoteLoading'][containerKey]) {
        return globalScope['remoteLoading'][containerKey];
      }
    }
    // @ts-ignore
    asyncContainer = new Promise<AsyncContainer>(function (resolve, reject) {
      function resolveRemoteGlobal(): void {
        const asyncContainer: AsyncContainer = globalScope[
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

          const errorType: string | undefined =
            event && (event.type === 'load' ? 'missing' : event.type);
            const realSrc: string | undefined | null =
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
      globalScope['remoteLoading'] = globalScope['remoteLoading'] || {};
      globalScope['remoteLoading'][containerKey] = asyncContainer;
    }
  }

  return asyncContainer;
};

export const getRuntimeRemotes = (): RuntimeRemotesMap => {
  try {
    const runtimeRemotes: RuntimeRemotesMap = Object.entries(remoteVars).reduce(function (
      acc: RuntimeRemotesMap,
      item: [string, any]
    ): RuntimeRemotesMap {
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
      // if its a delegate module, skip it
      else if (typeof value === 'string' && value.startsWith('internal ')) {
        const [request, query] = value.replace('internal ', '').split('?');
        if (query) {
          const remoteSyntax = new URLSearchParams(query).get('remote');
          if (remoteSyntax) {
            const [url, global] = extractUrlAndGlobal(remoteSyntax);
            acc[key] = { global, url };
          }
        }
      }
      // if its just a string (global@url)
      else if (typeof value === 'string') {
        const [url, global] = extractUrlAndGlobal(value);
        acc[key] = { global, url };
      }
      // we dont know or currently support this type
      else {
        //@ts-ignore
        console.warn('remotes process', process.env.REMOTES);
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

