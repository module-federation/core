import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
} from './index';

export const NativeFederationTypeScriptRemote = GeneralRemote.rolldown;
export const NativeFederationTypeScriptHost = GeneralHost.rolldown;
