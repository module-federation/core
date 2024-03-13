import { RemoteOptions, HostOptions } from '@module-federation/dts-kit';

import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
} from '.';

export const NativeFederationTypeScriptRemote = GeneralRemote.vite as (
  options: RemoteOptions,
) => any;
export const NativeFederationTypeScriptHost = GeneralHost.vite as (
  options: HostOptions,
) => any;
