import * as runtime from '@module-federation/runtime';
import type {
  RemoteEntryInitOptions,
  SharedConfig,
} from '@module-federation/runtime/types';
import { initializeSharing } from './initializeSharing';
import { attachShareScopeMap } from './attachShareScopeMap';
import { initContainerEntry } from './initContainerEntry';

// FIXME: ideal situation => import { GlobalShareScope,UserOptions } from '@module-federation/runtime/types'
type ExcludeUndefined<T> = T extends undefined ? never : T;
type Shared = InitOptions['shared'];

type NonUndefined<T = Shared> = ExcludeUndefined<T>;

type InitOptions = Parameters<typeof runtime.init>[0];

type ModuleCache = runtime.FederationHost['moduleCache'];
type InferModule<T> = T extends Map<string, infer U> ? U : never;
type InferredModule = InferModule<ModuleCache>;
export type ShareScopeMap = runtime.FederationHost['shareScopeMap'];

type InitToken = Record<string, Record<string, any>>;

export interface InitializeSharingOptions {
  shareScopeName: string;
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

export interface WebpackRequire {
  (moduleId: string | number): any;
  o: (obj: Record<string, any>, key: string | number) => boolean;
  R: Array<string | number>;
  m: Record<string, (mod: any) => any>;
  c: Record<string, any>;
  I: (
    scopeName: string,
    initScope?: InitializeSharingOptions['initScope'],
  ) => ReturnType<typeof initializeSharing>;
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
  name: string;
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
export interface InitContainerEntryOptions {
  shareScope: ShareScopeMap[string];
  shareScopeKey: string;
  webpackRequire: WebpackRequire;
  remoteEntryInitOptions?: RemoteEntryInitOptions;
  initScope?: InitializeSharingOptions['initScope'];
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
    initContainerEntry: typeof initContainerEntry;
  };
  bundlerRuntimeOptions: {
    remotes?: Exclude<RemotesOptions, 'chunkId' | 'promises'>;
  };
  attachShareScopeMap?: typeof attachShareScopeMap;
  hasAttachShareScopeMap?: boolean;
  prefetch?: () => void;
}
