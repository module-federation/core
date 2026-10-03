import { createInstance, ModuleFederation } from '@module-federation/runtime';
import { global, share } from '@module-federation/runtime/helpers';
import * as core from '@module-federation/runtime/core';
const runtime: ModuleFederation = createInstance({ name: 'typed-consumer', remotes: [] });
const same: typeof core.ModuleFederation = ModuleFederation;
const factory: () => { value: string } = runtime.loadShareSync<{ value: string }>('proof');
global.getGlobalFederationInstance('typed-consumer', undefined);
void share; void same; void factory;

import { parseRuntimeImage } from '@module-federation/runtime-core';
const supplied: unknown = undefined;
const descriptor = parseRuntimeImage(supplied);
if (descriptor) { const version: 1 = descriptor.contract; void version; }
