import type { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { Compilation } from 'webpack';

export { ModuleFederationPluginOptions };

export interface FederatedTypesPluginOptions {
  disableTypeCompilation?: boolean;
  disableDownloadingRemoteTypes?: boolean;
  federationConfig: ModuleFederationPluginOptions;
  typescriptFolderName?: string;
  additionalFilesToCompile?: string[];
}

export interface TypesStatsJson {
  publicPath: string;
  files: Record<string, string>;
}

export type CompilationParams = Compilation['params'] & {
  federated_types: Record<string, string>;
};
