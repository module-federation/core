import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
} from './index';

export const NativeFederationTypeScriptRemote = GeneralRemote.rollup;
export const NativeFederationTypeScriptHost = GeneralHost.rollup;
