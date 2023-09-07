import {
  AsyncContainer,
  RemoteVars,
  RuntimeRemote,
  RuntimeRemotesMap,
  WebpackRemoteContainer,
} from '../types/index';

const pure = typeof process !== 'undefined' ? process.env['REMOTES'] || {} : {};
export const remoteVars = pure as RemoteVars;

export const extractUrlAndGlobal = (urlAndGlobal: string): [string, string] => {
  const index = urlAndGlobal.indexOf('@');
  if (index <= 0 || index === urlAndGlobal.length - 1) {
    throw new Error(`Invalid request "${urlAndGlobal}"`);
  }
  return [urlAndGlobal.substring(index + 1), urlAndGlobal.substring(0, index)];
};

export const loadScript = async (keyOrRuntimeRemoteItem: string | RuntimeRemote) => {
  const runtimeRemotes = getRuntimeRemotes();
  let asyncContainer: Promise<WebpackRemoteContainer>;
  const reference = typeof keyOrRuntimeRemoteItem === 'string' ? runtimeRemotes[keyOrRuntimeRemoteItem] : keyOrRuntimeRemoteItem;

  if (reference.asyncContainer) {
    asyncContainer = reference.asyncContainer
  } else {
    const remoteGlobal = reference.global as unknown as string;
    const containerKey = reference.uniqueKey ? (reference.uniqueKey as unknown as string) : remoteGlobal;

    const globalScope = typeof window !== 'undefined' ? window : globalThis.__remote_scope__ || {};
    globalScope['_config'] = globalScope['_config'] || {};
    globalScope['_config'][containerKey] = reference.url;

    globalScope['remoteLoading'] = globalScope['remoteLoading'] || {};
    if (globalScope['remoteLoading'][containerKey]) {
      return globalScope['remoteLoading'][containerKey];
    }

    asyncContainer = new Promise<WebpackRemoteContainer>((resolve, reject) => {
      const resolveRemoteGlobal = () => resolve(globalScope[remoteGlobal] as unknown as WebpackRemoteContainer);
    
      if (globalScope[remoteGlobal]) {
        return resolveRemoteGlobal();
      }
    
      (__webpack_require__ as any).l(reference.url, (event: Event) => {
        if (globalScope[remoteGlobal]) {
          return resolveRemoteGlobal();
        }
    
        const errorType = event && (event.type === 'load' ? 'missing' : event.type);
        const realSrc = event && event.target && (event.target as HTMLScriptElement).src;
    
        const __webpack_error__ = new Error(`Loading script failed.\n(${errorType}: ${realSrc} or global var ${remoteGlobal})`) as Error & {
          type: string;
          request: string | null;
        };
        __webpack_error__.name = 'ScriptExternalLoadError';
        __webpack_error__.type = errorType;
        __webpack_error__.request = realSrc;
    
        reject(__webpack_error__);
      }, containerKey);
    }).catch((err) => {
      console.error('container is offline, returning fake remote', err);
      return {
        fake: true,
        get: (arg: any) => {
          console.warn('faking', arg, 'module on, its offline');
          return () => Promise.resolve({ __esModule: true, default: () => null });
        },
        init: () => {},
      } as unknown as WebpackRemoteContainer; // Ensure the returned object is of type WebpackRemoteContainer
    });
    globalScope['remoteLoading'][containerKey] = asyncContainer;
  }

  return asyncContainer;
};

export const getRuntimeRemotes = () => {
  const runtimeRemotes = Object.entries(remoteVars).reduce((acc, [key, value]) => {
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
      throw new Error(`[mf] Invalid value received for runtime_remote "${key}"`);
    }
    return acc;
  }, {} as RuntimeRemotesMap);

  return runtimeRemotes;
};


