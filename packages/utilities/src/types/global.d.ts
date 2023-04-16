/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
import type { AsyncContainer, WebpackRemoteContainer } from '../types';

export {};

export type RemoteScope = {
  [index: string]: AsyncContainer | string | undefined | Record<string, string>;
};

declare global {
  var __remote_scope__: RemoteScope;

  module NodeJS {
    interface Global {
      __remote_scope__: Record<string, WebpackRemoteContainer>;
    }
  }

  interface Window {
    [index: string | number]: unknown;
    // TODO: to match promise template system, can be removed once promise template is gone
    remoteLoading?: {
      [index: string]: AsyncContainer | undefined;
    };
    __remote_scope__: Record<string, WebpackRemoteContainer>;
  }
}
