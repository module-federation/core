import { moduleFederationPlugin } from '@module-federation/sdk';

export interface VmokType {
  config?: moduleFederationPlugin.ModuleFederationPluginOptions;
  configPath?: string;
  ssrRuntime?: boolean;
}
