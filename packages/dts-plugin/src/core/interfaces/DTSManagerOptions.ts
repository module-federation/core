import { moduleFederationPlugin } from '@module-federation/sdk';
import { HostOptions } from './HostOptions';
import { RemoteOptions } from './RemoteOptions';

export interface DTSManagerOptions {
  remote?: RemoteOptions;
  host?: HostOptions;
  extraOptions?: Record<string, any>;
  displayErrorInTerminal?: moduleFederationPlugin.PluginDtsOptions['displayErrorInTerminal'];
}
