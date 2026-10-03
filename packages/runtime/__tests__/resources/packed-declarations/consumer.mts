import { createInstance, ModuleFederation } from '@module-federation/runtime';
import { global, share } from '@module-federation/runtime/helpers';
import * as core from '@module-federation/runtime/core';

const runtime: ModuleFederation = createInstance({
  name: 'typed-consumer',
  remotes: [],
});
const constructor: typeof core.ModuleFederation = ModuleFederation;
const factory: () => { value: string } = runtime.loadShareSync<{
  value: string;
}>('proof');
global.getGlobalFederationInstance('typed-consumer', undefined);
void share;
void constructor;
void factory;
