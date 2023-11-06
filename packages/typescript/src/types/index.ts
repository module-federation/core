// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../../../node_modules/webpack/module.d.ts" />

import { Compilation, container } from 'webpack';

export type ModuleFederationPluginOptions = ConstructorParameters<
  typeof container.ModuleFederationPlugin
>['0'];

export interface TypeFetchOptions {
  /** The maximum time to wait for downloading remote types in milliseconds.
   * @default 2000  */
  downloadRemoteTypesTimeout?: number;
  /** The maximum number of retry attempts.
   * @default 3  */
  maxRetryAttempts?: number;
  /** The default number of milliseconds between retries.
   * @default 1000  */
  retryDelay?: number;
  /** Should retry if no types are found in destination.
   * @default true  */
  shouldRetryOnTypesNotFound?: boolean;
  /** Should retry type fetching operations.
   * @default true  */
  shouldRetry?: boolean;
}

export interface TypeServeOptions {
  /** The port to serve type files on, this is separate from the webpack dev server port. */
  port?: number;
  /** The host to serve type files on. Example: 'localhost' */
  host?: string;
}

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
  compiler?: 'tsc' | 'vue-tsc';
  typeFetchOptions?: TypeFetchOptions;
  typeServeOptions?: TypeServeOptions;
}

export interface TypesStatsJson {
  publicPath: string;
  files: Record<string, string>;
}

export type CompilationParams = Compilation['params'] & {
  federated_types: Record<string, string>;
};
