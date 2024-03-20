import { moduleFederationPlugin } from '@module-federation/sdk';

export interface HostOptions {
  moduleFederationConfig: moduleFederationPlugin.ModuleFederationPluginOptions;
  typesFolder?: string;
  remoteTypesFolder?: string;
  deleteTypesFolder?: boolean;
  maxRetries?: number;
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
