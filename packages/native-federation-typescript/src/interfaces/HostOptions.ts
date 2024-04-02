import { moduleFederationPlugin } from '@module-federation/sdk';

export interface HostOptions extends moduleFederationPlugin.DtsHostOptions {
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  context?: string;
  implementation?: string;
}

export interface RemoteInfo {
  name: string;
  url: string;
  alias: string;
  zipUrl?: string;
  apiTypeUrl?: string;
}
