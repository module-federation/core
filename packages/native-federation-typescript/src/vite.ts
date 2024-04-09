import {
  NativeFederationTypeScriptHost as GeneralHost,
  NativeFederationTypeScriptRemote as GeneralRemote,
} from '.';
import { HostOptions } from './interfaces/HostOptions';
import { RemoteOptions } from './interfaces/RemoteOptions';
export const NativeFederationTypeScriptRemote = GeneralRemote.vite as (
  options: RemoteOptions,
) => any;
export const NativeFederationTypeScriptHost = GeneralHost.vite as (
  options: HostOptions,
) => any;
