import { getScope } from '../../lib/scopes';
import type { AsyncContainer, RemoteOptions, SharedScope } from '../../types';
import type { WebpackRequire } from './types';

export async function initializeSharingScope(
  scopeName = 'default',
): Promise<SharedScope> {
  const webpackShareScopes = __webpack_share_scopes__ as unknown as SharedScope;

  if (!webpackShareScopes?.default) {
    await __webpack_init_sharing__(scopeName);
  }

  // TODO: Why would we reference __webpack_require and not __webpack_share_scopes__ ?
  return (__webpack_require__ as unknown as WebpackRequire)
    .S as unknown as SharedScope;
}

export function loadScript(containerKey: string, remoteOptions: RemoteOptions) {
  return webpackLoadScript(containerKey, remoteOptions.url);
}

export async function webpackLoadScript(
  containerKey: string,
  url: string,
): AsyncContainer {
  const scope = getScope();

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
        const realSrc = (event?.target as HTMLScriptElement)?.src;

        const __webpack_error__ = Object.assign(new Error(), {
          message: `@mf-core: script failed to load. (${errorType}: ${realSrc} or global var ${containerKey} not exists)`,
          name: 'ScriptExternalLoadError',
          type: errorType,
          request: realSrc,
        });

        reject(__webpack_error__);
      },
      containerKey,
    );
  });
}
