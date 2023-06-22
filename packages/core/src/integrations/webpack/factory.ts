import {
  RemoteOptions,
  RemoteContainer,
  RemoteScope,
  AsyncContainer,
} from '../../types';
import { IRemoteScriptFactory } from '../types';

import { ISharingScopeFactory } from '../types';
import { WebpackSharedScope } from './types';

export class WebpackSharingScopeFactory implements ISharingScopeFactory {
  async initializeSharingScope(scopeName: string): Promise<WebpackSharedScope> {
    const webpackShareScopes =
      __webpack_share_scopes__ as unknown as WebpackSharedScope;

    if (!webpackShareScopes?.default) {
      await __webpack_init_sharing__(scopeName);
    }

    return __webpack_share_scopes__ as unknown as WebpackSharedScope;
  }
}

export class WebpackScriptFactory implements IRemoteScriptFactory {
  loadScript(
    scope: RemoteScope,
    containerKey: string,
    remoteOptions: RemoteOptions
  ): AsyncContainer {
    const { url } = remoteOptions;
    const __webpack_error__ = new Error() as Error & {
      type: string;
      request: string | null;
    };

    return new Promise<RemoteContainer>(function (resolve, reject) {
      function resolveRemoteGlobal() {
        const asyncContainer = scope[containerKey] as unknown as AsyncContainer;
        return resolve(asyncContainer);
      }

      if (typeof scope[containerKey] !== 'undefined') {
        return resolveRemoteGlobal();
      }

      // TODO: Fix the type here.
      (__webpack_require__ as any).l(
        url,
        function (event: Event) {
          console.log('Test: ', event, scope, containerKey);
          if (typeof scope[containerKey] !== 'undefined') {
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
  }
}
