import type { ModuleFederationPluginOptions } from '@module-federation/utilities';

export { ModuleFederationPluginOptions };

export interface FederatedTypesPluginOptions {
  federationConfig: ModuleFederationPluginOptions;
}

export interface TypesStatsJson {
  files: Record<string, string>;
}
