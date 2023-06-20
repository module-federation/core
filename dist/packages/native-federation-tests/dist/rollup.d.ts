import { R as RemoteOptions, H as HostOptions } from './RemoteOptions-ae724cfa.js';
import 'tsup';

declare const NativeFederationTestsRemote: (options: RemoteOptions) => undefined | undefined[];
declare const NativeFederationTestsHost: (options: HostOptions) => undefined | undefined[];

export { NativeFederationTestsHost, NativeFederationTestsRemote };
