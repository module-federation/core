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

  // Module-specific constants
  const __VERSION__: string;
  const FEDERATION_DEBUG: string;
  const FEDERATION_ALLOW_NEW_FUNCTION: boolean | string | undefined;
}
