import { WebpackPluginInstance } from 'unplugin';

import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
  EnhancedRemoteOptions,
  EnhancedHostOptions,
} from './index';

export const NativeFederationTypeScriptRemote: (
  options: EnhancedRemoteOptions,
) => WebpackPluginInstance = GeneralRemote.webpack;
export const NativeFederationTypeScriptHost: (
  options: EnhancedHostOptions,
) => WebpackPluginInstance = GeneralHost.webpack;
