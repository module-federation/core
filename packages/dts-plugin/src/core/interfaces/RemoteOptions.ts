import { moduleFederationPlugin } from '@module-federation/sdk';

export interface RemoteOptions extends moduleFederationPlugin.DtsRemoteOptions {
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  context?: string;
  implementation?: string;
  hostRemoteTypesFolder?: string;
  outputDir?: string;
}
