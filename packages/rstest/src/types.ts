import type { moduleFederationPlugin } from '@module-federation/sdk';

export type ModuleFederationOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

export type RstestFederationOptions = {
  target?: 'node' | 'browser';
};

export type RuntimePlugin = NonNullable<
  ModuleFederationOptions['runtimePlugins']
>[number];
