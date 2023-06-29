import type { ISharingScopeFactory, SharedScope } from '../../types';
import type { WebpackRequire, WebpackSharedScope } from './types';

export class WebpackSharingScopeFactory implements ISharingScopeFactory {
  async initializeSharingScope(scopeName: string): Promise<SharedScope> {
    const webpackShareScopes =
      __webpack_share_scopes__ as unknown as WebpackSharedScope;

    if (!webpackShareScopes?.default) {
      await __webpack_init_sharing__(scopeName);
    }

    // TODO: Why would we reference __webpack_require and not __webpack_share_scopes__ ?
    return (__webpack_require__ as unknown as WebpackRequire).S[
      scopeName
    ] as unknown as SharedScope;
  }
}
