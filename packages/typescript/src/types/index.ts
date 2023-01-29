import type { ModuleFederationPluginOptions } from '@module-federation/utilities';
import { Compilation } from 'webpack';

export { ModuleFederationPluginOptions };

export interface FederatedTypesPluginOptions {
  disableTypeCompilation?: boolean;
  disableDownloadingRemoteTypes?: boolean;
  federationConfig: ModuleFederationPluginOptions;
  /** @default '@mf-types'*/
  typescriptFolderName?: string;
  /** @default '_types' */
  typescriptCompiledFolderName?: string;
  additionalFilesToCompile?: string[];
  /** @default 'tsc' */
  compiler: 'tsc' | 'vue-tsc';
}

export interface TypesStatsJson {
  publicPath: string;
  files: Record<string, string>;
}

export type CompilationParams = Compilation['params'] & {
  federated_types: Record<string, string>;
};
