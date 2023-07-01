/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
import type { AsyncContainer, RemoteScope } from './src/types';

declare global {
  namespace globalThis {
    // eslint-disable-next-line no-var
    var __remote_scope__: RemoteScope;
  }

  namespace NodeJS {
    interface Global {
      [index: string | number]: unknown;
      __remote_scope__: RemoteScope;
    }
  }

  interface Window {
    [index: string | number]: unknown;
    // TODO: to match promise template system, can be removed once promise template is gone
    remoteLoading: Record<string, AsyncContainer | undefined>;
    __remote_scope__: Record<string, WebpackRemoteContainer>;
  }
}
