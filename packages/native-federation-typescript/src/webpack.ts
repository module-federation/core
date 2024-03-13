import { WebpackPluginInstance } from 'unplugin';
import { RemoteOptions, HostOptions } from '@module-federation/dts-kit';

import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
} from '.';

export const NativeFederationTypeScriptRemote: (
  options: RemoteOptions,
) => WebpackPluginInstance = GeneralRemote.webpack;
export const NativeFederationTypeScriptHost: (
  options: HostOptions,
) => WebpackPluginInstance = GeneralHost.webpack;
