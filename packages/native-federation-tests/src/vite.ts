import {
  NativeFederationTestsHost as GeneralHost,
  NativeFederationTestsRemote as GeneralRemote,
} from '.';
import { HostOptions } from './interfaces/HostOptions';
import { RemoteOptions } from './interfaces/RemoteOptions';

export const NativeFederationTestsRemote = GeneralRemote.vite as (
  options: RemoteOptions,
) => any;
export const NativeFederationTestsHost = GeneralHost.vite as (
  options: HostOptions,
) => any;
