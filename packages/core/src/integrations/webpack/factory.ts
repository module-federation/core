import type {
  AsyncContainer,
  IRemoteScriptFactory,
  ISharingScopeFactory,
  RemoteOptions,
  SharedScope,
} from '../../types';
import type { WebpackRequire } from './types';

export class WebpackSharingScopeFactory implements ISharingScopeFactory {
  async initializeSharingScope(scopeName = 'default'): Promise<SharedScope> {
    const webpackShareScopes =
      __webpack_share_scopes__ as unknown as SharedScope;

    if (!webpackShareScopes?.default) {
      await __webpack_init_sharing__(scopeName);
    }

    // TODO: Why would we reference __webpack_require and not __webpack_share_scopes__ ?
    return (__webpack_require__ as unknown as WebpackRequire)
      .S as unknown as SharedScope;
  }
}

export class WebpackRemoteScriptFactory implements IRemoteScriptFactory {
  loadScript(containerKey: string, remoteOptions: RemoteOptions) {
    return webpackLoadScript(containerKey, remoteOptions.url);
  }
}

const webpackLoadScript = (
  containerKey: string,
  url: string
): AsyncContainer => {
  const scope =
    typeof window !== 'undefined'
      ? window
      : //@ts-ignore
        global.__remote_scope__;

  return new Promise(function (resolve, reject) {
    function resolveRemoteGlobal() {
      const asyncContainer = scope[containerKey] as unknown as AsyncContainer;
      return resolve(asyncContainer);
    }

    if (typeof scope[containerKey] !== 'undefined') {
      return resolveRemoteGlobal();
    }

    (__webpack_require__ as unknown as WebpackRequire).l(
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
