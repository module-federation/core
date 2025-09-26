import * as runtime from '@module-federation/runtime';
import type {
  Remote,
  RemoteEntryInitOptions,
  SharedConfig,
} from '@module-federation/runtime/types';
import { initializeSharing } from './initializeSharing';
import { attachShareScopeMap } from './attachShareScopeMap';
import { initContainerEntry } from './initContainerEntry';
import type { moduleFederationPlugin } from '@module-federation/sdk';

// FIXME: ideal situation => import { GlobalShareScope,UserOptions } from '@module-federation/runtime/types'
type ExcludeUndefined<T> = T extends undefined ? never : T;
type Shared = InitOptions['shared'];

type NonUndefined<T = Shared> = ExcludeUndefined<T>;

type InitOptions = Omit<Parameters<typeof runtime.init>[0], 'remotes'> & {
  remotes: Array<
    Remote & { externalType: moduleFederationPlugin.ExternalsType }
  >;
};

type ModuleCache = runtime.ModuleFederation['moduleCache'];
type InferModule<T> = T extends Map<string, infer U> ? U : never;
type InferredModule = InferModule<ModuleCache>;
export type ShareScopeMap = runtime.ModuleFederation['shareScopeMap'];

type InitToken = Record<string, Record<string, any>>;

export interface InitializeSharingOptions {
  shareScopeName: string | string[];
  webpackRequire: WebpackRequire;
  initPromises: Record<string, Promise<boolean> | boolean>;
  initTokens: InitToken;
  initScope: InitToken[];
}

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
export type IdToExternalAndNameMapping = Record<
  string,
  IdToExternalAndNameMappingItemWithPromise
>;

type ModuleId = string | number;

export type ModuleIdToRemoteDataMapping = Record<
  ModuleId,
  {
    shareScope: string;
    name: string;
    externalModuleId: ModuleId;
    remoteName: string;
  }
>;
export interface WebpackRequire {
  (moduleId: string | number): any;
  o: (obj: Record<string, any>, key: string | number) => boolean;
  R: Array<string | number>;
  m: Record<string, (mod: any) => any>;
  c: Record<string, any>;
  I: (
    // v1 use string , v2 support string[]
    scopeName: string | string[],
    initScope?: InitializeSharingOptions['initScope'],
  ) => ReturnType<typeof initializeSharing>;
  S?: InferredGlobalShareScope;
  federation: Federation;
  consumesLoadingData?: {
    chunkMapping: Record<string, Array<string | number>>;
    moduleIdToConsumeDataMapping: Record<string, ModuleToHandlerMappingItem>;
    initialConsumes: Array<ModuleId>;
  };
  remotesLoadingData?: {
    chunkMapping?: Record<string, Array<ModuleId>>;
    moduleIdToRemoteDataMapping?: ModuleIdToRemoteDataMapping;
  };
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

export interface IdToRemoteMapItem {
  externalType: string;
  name: string;
}

export type IdToRemoteMap = Record<string, IdToRemoteMapItem[]>;

export type RemoteInfos = Record<
  string,
  Array<
    IdToRemoteMapItem & {
      alias: string;
      entry?: string;
      shareScope: string;
    }
  >
>;
export interface RemotesOptions {
  chunkId: string | number;
  promises: Promise<any>[];
  // some legacy rspack version may not have this value
  remoteInfos?: RemoteInfos;
  webpackRequire: WebpackRequire;
  /*
   * @deprecated It will be removed after stable version release
   */
  idToRemoteMap?: IdToRemoteMap;
  /*
   * @deprecated It will be removed after stable version release
   */
  chunkMapping?: Record<string, Array<string | number>>;
  /*
   * @deprecated It will be removed after stable version release
   */
  idToExternalAndNameMapping?: Record<
    string,
    IdToExternalAndNameMappingItemWithPromise
  >;
}

export interface HandleInitialConsumesOptions {
  moduleId: string | number;
  moduleIdToConsumeDataMapping: Record<string, ModuleToHandlerMappingItem>;
  webpackRequire: WebpackRequire;
}
export interface InstallInitialConsumesOptions {
  webpackRequire: WebpackRequire;
  installedModules: Record<string, Promise<any> | 0>;
}

export interface ConsumesOptions {
  chunkId: string | number;
  promises: Promise<any>[];
  installedModules: Record<string, Promise<any> | 0>;
  webpackRequire: WebpackRequire;
}
export interface InitContainerEntryOptions {
  shareScope: ShareScopeMap[string];
  shareScopeKey: string | string[];
  webpackRequire: WebpackRequire;
  remoteEntryInitOptions?: RemoteEntryInitOptions;
  initScope?: InitializeSharingOptions['initScope'];
}

export interface Federation {
  runtime?: typeof runtime;
  instance?: runtime.ModuleFederation;
  initOptions?: InitOptions;
  installInitialConsumes?: (options: InstallInitialConsumesOptions) => any;
  bundlerRuntime?: {
    remotes: (options: RemotesOptions) => void;
    consumes: (options: ConsumesOptions) => void;
    I: typeof initializeSharing;
    S: InferredGlobalShareScope;
    installInitialConsumes: (options: InstallInitialConsumesOptions) => any;
    initContainerEntry: typeof initContainerEntry;
  };
  bundlerRuntimeOptions: {
    remotes?: Exclude<RemotesOptions, 'chunkId' | 'promises'>;
  };
  attachShareScopeMap?: typeof attachShareScopeMap;
  hasAttachShareScopeMap?: boolean;
  prefetch?: () => void;
}
