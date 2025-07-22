declare const __VERSION__: string;
declare const FEDERATION_DEBUG: string;
declare const FEDERATION_BUILD_IDENTIFIER: string | undefined;
declare const __RELEASE_NUMBER__: number;
declare const FEDERATION_ALLOW_NEW_FUNCTION: string | undefined;

import { Federation } from '@module-federation/runtime-core';
import { RemoteEntryExports } from '@module-federation/runtime-core';

declare global {
  // eslint-disable-next-line no-var
  var __FEDERATION__: Federation;
  // eslint-disable-next-line no-var
  var __VMOK__: Federation;
  // eslint-disable-next-line no-var
  var __GLOBAL_LOADING_REMOTE_ENTRY__: Record<
    string,
    undefined | Promise<RemoteEntryExports | void>
  >;
}
