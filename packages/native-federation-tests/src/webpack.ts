import { WebpackPluginInstance } from 'unplugin';

import {
  NativeFederationTestsHost as GeneralHost,
  NativeFederationTestsRemote as GeneralRemote,
} from '.';

import { HostOptions } from './interfaces/HostOptions';
import { RemoteOptions } from './interfaces/RemoteOptions';

export const NativeFederationTestsRemote: (
  options: RemoteOptions,
) => WebpackPluginInstance = GeneralRemote.webpack;
export const NativeFederationTestsHost: (
  options: HostOptions,
) => WebpackPluginInstance = GeneralHost.webpack;
