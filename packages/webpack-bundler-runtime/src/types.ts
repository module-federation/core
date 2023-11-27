import * as runtime from '@module-federation/runtime';
import { initializeSharing } from './initializeSharing';

// FIXME: ideal situation => import { GlobalShareScope,UserOptions } from '@module-federation/runtime/type'
type ExcludeUndefined<T> = T extends undefined ? never : T;
type NonUndefined<T = Shared> = ExcludeUndefined<T>;

type InitOptions = Parameters<typeof runtime.init>[0];
type Shared = InitOptions['shared'];

type SharedConfig = NonUndefined<NonUndefined[string]['shareConfig']>;

type ModuleCache = runtime.FederationHost['moduleCache'];
type InferModule<T> = T extends Map<string, infer U> ? U : never;
type InferredModule = InferModule<ModuleCache>;
export type RemoteEntryExports = NonUndefined<
  InferredModule['remoteEntryExports']
>;

type ExtractInitParameters<T> = T extends {
  init: (shareScope: infer U, ...args: any[]) => void;
}
  ? U
  : never;

type InferredShareScope = ExtractInitParameters<RemoteEntryExports>;
type InferredGlobalShareScope = {
  [scope: string]: InferredShareScope;
};

// shareScope, name, externalModuleId
type IdToExternalAndNameMappingItem = [string, string, string | number];

interface IdToExternalAndNameMappingItemWithPromise
  extends IdToExternalAndNameMappingItem {
  p?: Promise<any> | number;
}

export interface WebpackRequire {
  (moduleId: string | number): any;
  o: (obj: Record<string, any>, key: string | number) => boolean;
  R: Array<string | number>;
  m: Record<string, (mod: any) => any>;
  c: Record<string, any>;
  I: typeof initializeSharing;
  S?: InferredGlobalShareScope;
  federation: Federation;
}

interface ShareInfo {
  shareConfig: SharedConfig;
  scope: Array<string>;
}

interface ModuleToHandlerMappingItem {
  // handler: (shareInfo: ShareInfo, type?: 'syn' | 'async') => Promise<any>;
  getter: () => Promise<any>;
  shareInfo: ShareInfo;
  shareKey: string;
}

interface IdToRemoteMapItem {
  externalType: string;
  request: string;
  remoteName?: string;
  externalModuleId?: string | number;
}

export interface RemotesOptions {
  chunkId: string | number;
  promises: Promise<any>[];
  chunkMapping: Record<string, Array<string | number>>;
  idToExternalAndNameMapping: Record<
    string,
    IdToExternalAndNameMappingItemWithPromise
  >;
  idToRemoteMap: Record<string, IdToRemoteMapItem[]>;
  webpackRequire: WebpackRequire;
}

export interface HandleInitialConsumesOptions {
  moduleId: string | number;
  moduleToHandlerMapping: Record<string, ModuleToHandlerMappingItem>;
  webpackRequire: WebpackRequire;
}
export interface InstallInitialConsumesOptions {
  moduleToHandlerMapping: Record<string, ModuleToHandlerMappingItem>;
  webpackRequire: WebpackRequire;
  installedModules: Record<string, Promise<any> | 0>;
  initialConsumes: Array<string | number>;
}

export interface ConsumesOptions {
  chunkId: string | number;
  promises: Promise<any>[];
  chunkMapping: Record<string, Array<string | number>>;
  installedModules: Record<string, Promise<any> | 0>;
  moduleToHandlerMapping: Record<string, ModuleToHandlerMappingItem>;
  webpackRequire: WebpackRequire;
}

export interface Federation {
  runtime?: typeof runtime;
  instance?: runtime.FederationHost;
  initOptions?: InitOptions;
  installInitialConsumes?: (options: InstallInitialConsumesOptions) => any;
  bundlerRuntime?: {
    remotes: (options: RemotesOptions) => void;
    consumes: (options: ConsumesOptions) => void;
    I: typeof initializeSharing;
    S: InferredGlobalShareScope;
    installInitialConsumes: (options: InstallInitialConsumesOptions) => any;
  };
  bundlerRuntimeOptions?: {
    remotes: RemotesOptions;
  };
}
