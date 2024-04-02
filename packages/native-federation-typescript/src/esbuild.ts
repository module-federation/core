import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
} from './index';

export const NativeFederationTypeScriptRemote = GeneralRemote.esbuild;
export const NativeFederationTypeScriptHost = GeneralHost.esbuild;
