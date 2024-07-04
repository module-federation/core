import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
} from '.';

export const NativeFederationTypeScriptRemote = GeneralRemote.farm;
export const NativeFederationTypeScriptHost = GeneralHost.farm;
