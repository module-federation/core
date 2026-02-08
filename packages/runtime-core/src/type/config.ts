import type {
  RemoteWithEntry,
  RemoteWithVersion,
  Module,
  RemoteEntryType,
  TreeShakingStatus,
} from '@module-federation/sdk';
import { ModuleFederationRuntimePlugin } from './plugin';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<T>;
export type PartialOptional<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: T[P];
};

export type RemoteEntryFormat = 'url' | 'importmap';

export interface RemoteInfoCommon {
  alias?: string;
  shareScope?: string | string[];
  type?: RemoteEntryType;
  entryGlobalName?: string;
  entryFormat?: RemoteEntryFormat;
}

export type RemoteInfoOptionalVersion = {
  name: string;
  version?: string;
} & RemoteInfoCommon;

export type Remote = (RemoteWithEntry | RemoteWithVersion) & RemoteInfoCommon;

export type LoadShareExtraOptions = {
  customShareInfo?: Partial<Shared>;
  resolver?: (sharedOptions: ShareInfos[string]) => Shared;
};

export interface RemoteInfo {
  alias?: string;
  name: string;
  version?: string;
  buildVersion?: string;
  entry: string;
  type: RemoteEntryType;
  entryGlobalName: string;
  shareScope: string | string[];
  entryFormat?: RemoteEntryFormat;
}

export type HostInfo = Pick<
  Options,
  'name' | 'version' | 'remotes' | 'version'
>;

export interface SharedConfig {
  singleton?: boolean;
  requiredVersion: false | string;
  eager?: boolean;
  strictVersion?: boolean;
  layer?: string | null;
}

export type TreeShakingArgs = {
  usedExports?: string[];
  get?: SharedGetter;
  lib?: () => Module;
  status?: TreeShakingStatus;
  mode?: 'server-calc' | 'runtime-infer';
  loading?: null | Promise<any>;
  loaded?: boolean;
  useIn?: Array<string>;
};

type SharedBaseArgs = {
  version?: string;
  shareConfig?: SharedConfig;
  scope?: string | Array<string>;
  deps?: Array<string>;
  strategy?: 'version-first' | 'loaded-first';
  loaded?: boolean;
  treeShaking?: TreeShakingArgs;
};

export type SharedGetter = (() => () => Module) | (() => Promise<() => Module>);

export type ShareArgs =
  | (SharedBaseArgs & { get: SharedGetter })
  | (SharedBaseArgs & { lib: () => Module })
  | SharedBaseArgs;
export type ShareStrategy = 'version-first' | 'loaded-first';

export type NoMatchedUsedExportsItem = [from: string, usedExports?: string[]];
export type Shared = {
  version: string;
  get: SharedGetter;
  shareConfig: SharedConfig;
  scope: Array<string>;
  useIn: Array<string>;
  from: string;
  deps: Array<string>;
  lib?: () => Module;
  loaded?: boolean;
  loading?: null | Promise<any>;
  // compatibility with previous shared
  eager?: boolean;
  /**
   * @deprecated set in initOptions.shareStrategy instead
   */
  strategy: ShareStrategy;
  treeShaking?: TreeShakingArgs;
  // _noMatchedUsedExports?: NoMatchedUsedExportsItem[];
};

export type ShareScopeMap = {
  [scope: string]: {
    [pkgName: string]: {
      [sharedVersion: string]: Shared;
    };
  };
};

export type GlobalShareScopeMap = {
  [instanceName: string]: ShareScopeMap;
};

export type ShareInfos = {
  [pkgName: string]: Shared[];
};

export interface Options {
  id?: string;
  name: string;
  version?: string;
  remotes: Array<Remote>;
  shared: ShareInfos;
  plugins: Array<ModuleFederationRuntimePlugin>;
  inBrowser: boolean;
  shareStrategy?: ShareStrategy;
}

export type UserOptions = Omit<
  Optional<Options, 'plugins'>,
  'shared' | 'inBrowser'
> & {
  shared?: {
    [pkgName: string]: ShareArgs | ShareArgs[];
  };
};

export type LoadModuleOptions = {
  version?: string;
};

// Only for legacy federation provider
export type RemoteEntryInitOptions = {
  version: string;
  shareScopeMap?: ShareScopeMap;
  shareScopeKeys: string | string[];
};

export type InitTokens = Record<string, Record<string, any>>;
export type InitScope = InitTokens[];
export type CallFrom = 'build' | 'runtime';
export type RemoteEntryExports = {
  get: (id: string) => () => Promise<Module>;
  init: (
    shareScope: ShareScopeMap[string],
    initScope?: InitScope,
    remoteEntryInitOPtions?: RemoteEntryInitOptions,
  ) => void | Promise<void>;
};
