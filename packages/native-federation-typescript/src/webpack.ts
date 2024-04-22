import { WebpackPluginInstance } from 'unplugin';

import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
} from '.';

import { HostOptions } from './interfaces/HostOptions';
import { RemoteOptions } from './interfaces/RemoteOptions';

export const NativeFederationTypeScriptRemote: (
  options: RemoteOptions,
) => WebpackPluginInstance = GeneralRemote.webpack;
export const NativeFederationTypeScriptHost: (
  options: HostOptions,
) => WebpackPluginInstance = GeneralHost.webpack;
