import type {
  ModuleFederationRuntimePlugin,
  UserOptions,
} from '@module-federation/runtime-core';
import { initOptions } from '@module-federation/webpack-bundler-runtime';
import { createFederation } from '@module-federation/webpack-bundler-runtime/compose';
import { consumes } from '@module-federation/webpack-bundler-runtime/adapters/consumes';

declare const plugin: ModuleFederationRuntimePlugin;

export const options: UserOptions = initOptions!;
initOptions!.plugins!.push(plugin);
export const federation = createFederation({
  buildId: 'host:1.0.0',
  capabilities: {},
  adapters: [consumes],
});
