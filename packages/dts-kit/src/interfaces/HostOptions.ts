import { moduleFederationPlugin } from '@module-federation/sdk';

export interface HostOptions {
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  typesFolder?: string;
  deleteTypesFolder?: boolean;
  maxRetries?: number;
  devServer?: {
    typesReload?: boolean;
  };
  implementation?: string;
}

export interface RemoteInfo {
  name: string;
  url: string;
  alias: string;
  zipUrl?: string;
  apiTypeUrl?: string;
}
