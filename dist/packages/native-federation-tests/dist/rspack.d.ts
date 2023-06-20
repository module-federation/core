import { R as RemoteOptions, H as HostOptions } from './RemoteOptions-ae724cfa.js';
import 'tsup';

declare const NativeFederationTestsRemote: (options: RemoteOptions) => RspackPluginInstance;
declare const NativeFederationTestsHost: (options: HostOptions) => RspackPluginInstance;

export { NativeFederationTestsHost, NativeFederationTestsRemote };
