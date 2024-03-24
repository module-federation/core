import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
  EnhancedRemoteOptions,
  EnhancedHostOptions,
} from './index';

export const NativeFederationTypeScriptRemote = GeneralRemote.vite as (
  options: EnhancedRemoteOptions,
) => any;
export const NativeFederationTypeScriptHost = GeneralHost.vite as (
  options: EnhancedHostOptions,
) => any;
