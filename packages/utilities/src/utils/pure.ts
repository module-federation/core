import type { RemoteScope } from '../types/global';
import type {
  AsyncContainer,
  RemoteVars,
  RuntimeRemote,
  RuntimeRemotesMap,
  WebpackRemoteContainer,
  WebpackRequire,
} from '../types/index';

let pure = {} as RemoteVars;
try {
  // @ts-ignore
  pure = process.env['REMOTES'] || {};
} catch (e) {
  // not in webpack bundle
}
export const remoteVars = pure as RemoteVars;

export const extractUrlAndGlobal = (urlAndGlobal: string): [string, string] => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};

export const loadScript = (
  keyOrRuntimeRemoteItem: string | RuntimeRemote
): AsyncContainer | undefined => {
  const runtimeRemotes = getRuntimeRemotes();

  const reference =
    typeof keyOrRuntimeRemoteItem === 'string'
      ? runtimeRemotes[keyOrRuntimeRemoteItem]
      : keyOrRuntimeRemoteItem;

  if (reference.asyncContainer) {
    if (typeof reference.asyncContainer === 'function') {
      return reference.asyncContainer();
    }

    return reference.asyncContainer;
  }

  const remoteGlobal = reference.global;

  if (!remoteGlobal) {
    throw new Error('Reference global is undefined');
  }

  // Check if theres an override for container key if not use remote global
  const containerKey = reference.uniqueKey ? reference.uniqueKey : remoteGlobal;

  if (!global.__remote_scope__) {
    // create a global scope for container, similar to how remotes are set on window in the browser
    global.__remote_scope__ = {
      _config: {},
    };
  }

  const globalScope =
    typeof window !== 'undefined' ? window : globalThis.__remote_scope__;

  if (typeof window === 'undefined') {
    const remoteScope = globalScope as RemoteScope;

    if (!remoteScope['_config']) {
      remoteScope['_config'] = {};
    }

    const remoteScopeConfig = remoteScope['_config'] as Record<
      string,
      string | undefined
    >;

    remoteScopeConfig[containerKey] = reference.url;
  } else {
    const scope = globalScope as Window;
    // TODO: to match promise template system, can be removed once promise template is gone
    if (!scope.remoteLoading) {
      scope.remoteLoading = {};
    }
    if (scope.remoteLoading[containerKey]) {
      return scope.remoteLoading[containerKey];
    }
  }

  if (!reference.url) {
    throw new Error('Reference url is undefined');
  }

  const asyncContainer = createWebpackRemoteContainer(
    globalScope,
    remoteGlobal,
    reference.url,
    containerKey
  );

  if (typeof window !== 'undefined') {
    const scope = globalScope as Window;

    // TODO: to match promise template system, can be removed once promise template is gone
    if (!scope.remoteLoading) {
      scope.remoteLoading = {};
    }

    scope.remoteLoading[containerKey] = asyncContainer;
  }

  return asyncContainer;
};

const createWebpackRemoteContainer = async (
  globalScope: RemoteScope | Window,
  remoteName: string,
  remoteUrl: string,
  containerKey: string
) => {
  const __webpack_error__ = new Error() as Error & {
    type: string;
    request: string | null;
  };

  return new Promise<WebpackRemoteContainer>(function (resolve, reject) {
    function resolveRemoteGlobal() {
      const asyncContainer = globalScope[
        remoteName
      ] as unknown as AsyncContainer;
      return resolve(asyncContainer);
    }

    if (typeof globalScope[remoteName] !== 'undefined') {
      return resolveRemoteGlobal();
    }

    (__webpack_require__ as unknown as WebpackRequire).l(
      remoteUrl,
      function (event: Event) {
        if (typeof globalScope[remoteName] !== 'undefined') {
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
          remoteName +
          ')';

        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;

        reject(__webpack_error__);
      },
      containerKey
    );
  });
};

export const getRuntimeRemotes = () => {
  try {
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
