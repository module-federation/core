/* eslint-disable @typescript-eslint/prefer-namespace-keyword */

declare global {
  interface Window {
    [index: string | number]: unknown;
    // TODO: to match promise template system, can be removed once promise template is gone
    remoteLoading: Record<string, import('./types').AsyncContainer | undefined>;
    __remote_scope__: Record<string, import('./types').RemoteContainer>;
  }
}
