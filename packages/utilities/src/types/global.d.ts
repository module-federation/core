/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/prefer-namespace-keyword */
import type { WebpackRemoteContainer } from '.';

export {};

declare global {
  var __remote_scope__: Record<string, WebpackRemoteContainer>;

  module NodeJS {
    interface Global {
      __remote_scope__: Record<string, WebpackRemoteContainer>;
    }
  }

  interface Window {
    [index: string | number]: any;
    __remote_scope__: Record<string, WebpackRemoteContainer>;
  }
}
