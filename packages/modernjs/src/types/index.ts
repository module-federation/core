import { moduleFederationPlugin } from '@module-federation/sdk';

export interface PluginOptions {
  config?: moduleFederationPlugin.ModuleFederationPluginOptions;
  configPath?: string;
}
