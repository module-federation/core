import type {
  IRemoteScriptFactory,
  RemoteScope,
  AsyncContainer,
  RemoteOptions,
  RemoteScriptLoader,
} from '../types';

const urlCache = new Set();
export const loadScript = async (url: string, callback: () => void) => {
  if (!url) return;

  if (urlCache.has(url)) {
    return;
  }

  const element = document.createElement('script');

  element.src = url;
  element.type = 'text/javascript';
  element.async = true;

  element.onload = () => {
    urlCache.add(url);
    callback();
    document.head.removeChild(element);
  };

  element.onerror = () => {
    throw new Error(`Failed to load script at: ${url}`);
  };

  document.head.appendChild(element);
};

const webpackLoadScript = (
  scope: RemoteScope,
  containerKey: string,
  url: string
): Promise<AsyncContainer> => {
  return new Promise(function (resolve, reject) {
    function resolveRemoteGlobal() {
      const asyncContainer = scope[containerKey] as unknown as AsyncContainer;
      return resolve(asyncContainer);
    }

    if (typeof scope[containerKey] !== 'undefined') {
      return resolveRemoteGlobal();
    }

    (__webpack_require__ as any).l(
      url,
      function (event: Event) {
        if (typeof scope[containerKey] !== 'undefined') {
          return resolveRemoteGlobal();
        }

        const errorType =
          event && (event.type === 'load' ? 'missing' : event.type);
        const realSrc =
          event && event.target && (event.target as HTMLScriptElement).src;

        const __webpack_error__ = new Error() as Error & {
          type: string;
          request: string | null;
        };

        __webpack_error__.message =
          'Loading script failed.\n(' +
          errorType +
          ': ' +
          realSrc +
          ' or global var ' +
          containerKey +
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

/**
 * ScriptFactory is responsible for loading remote scripts and associating them with a scope.
 */
export class ScriptFactory implements IRemoteScriptFactory {
  remoteScriptLoader?: RemoteScriptLoader;

  /**
   *
   * @param remoteScriptLoader
   */
  constructor(remoteScriptLoader?: RemoteScriptLoader) {
    this.remoteScriptLoader = remoteScriptLoader;
  }

  loadScript(
    scope: RemoteScope,
    containerKey: string,
    remoteOptions: RemoteOptions
  ): AsyncContainer {
    return new Promise((resolve, reject) => {
      try {
        if (
          this.remoteScriptLoader &&
          typeof this.remoteScriptLoader === 'function'
        ) {
          const asyncContainer = this.remoteScriptLoader(
            scope,
            containerKey,
            remoteOptions
          );

          resolve(asyncContainer);
          return;
        }

        // Fallback to webpack for now.
        webpackLoadScript(scope, containerKey, remoteOptions.url).then(
          (asyncContainer) => {
            resolve(asyncContainer);
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  }
}
