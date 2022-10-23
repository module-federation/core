import type { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { Compilation } from 'webpack';

export { ModuleFederationPluginOptions };

export interface FederatedTypesPluginOptions {
  federationConfig: ModuleFederationPluginOptions;
}

export interface TypesStatsJson {
  files: Record<string, string>;
}

export type CompilationParams = Compilation['params'] & {
  federated_types_stats: TypesStatsJson;
};
