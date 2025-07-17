import { moduleFederationPlugin } from '@module-federation/sdk';

export type ModuleFederationPluginOptions =
  moduleFederationPlugin.ModuleFederationPluginOptions;

export type RemotesObject = ModuleFederationPluginOptions['remotes'];

// Export HMR types
export * from './hmr';
