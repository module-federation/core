/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
import type {
  AsyncContainer,
  WebpackRemoteContainer,
  RemoteScope,
} from '../types';

declare global {
  // eslint-disable-next-line no-var
  var __remote_scope__: RemoteScope;

  module NodeJS {
    interface Global {
      __remote_scope__: Record<string, WebpackRemoteContainer>;
    }
  }

  interface Window {
    [index: string | number]: unknown;
    // TODO: to match promise template system, can be removed once promise template is gone
    remoteLoading: Record<string, AsyncContainer | undefined>;
    __remote_scope__: Record<string, WebpackRemoteContainer>;
  }
}
