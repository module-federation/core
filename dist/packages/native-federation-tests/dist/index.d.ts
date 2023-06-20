import * as unplugin from 'unplugin';
import { R as RemoteOptions, H as HostOptions } from './RemoteOptions-ae724cfa.js';
import 'tsup';

declare const NativeFederationTestsRemote: unplugin.UnpluginInstance<RemoteOptions, boolean>;
declare const NativeFederationTestsHost: unplugin.UnpluginInstance<HostOptions, boolean>;

export { NativeFederationTestsHost, NativeFederationTestsRemote };
