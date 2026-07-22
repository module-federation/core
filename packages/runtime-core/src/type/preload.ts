import { Remote, RemoteInfo } from './config';

export type depsPreloadArg = Omit<PreloadRemoteArgs, 'depsRemote'>;

export interface PreloadRemoteArgs {
  nameOrAlias: string;
  exposes?: Array<string>;
  resourceCategory?: 'all' | 'sync';
  share?: boolean;
  depsRemote?: boolean | Array<depsPreloadArg>;
  filter?: (assetUrl: string) => boolean;
}

export type PreloadConfig = PreloadRemoteArgs;

export type PreloadOptions = Array<{
  remote: Remote;
  preloadConfig: PreloadConfig;
}>;

export type ResourceLoadInitiator = 'loadRemote' | 'preloadRemote';

export type ResourceLoadType = 'manifest' | 'remoteEntry' | 'js' | 'css';

export interface ResourceLoadContext {
  initiator: ResourceLoadInitiator;
  id: string;
  resourceType: ResourceLoadType;
  url?: string;
  expose?: string;
}

export type ResourceLoadOutcome =
  | 'success'
  | 'error'
  | 'timeout'
  | 'cached'
  | 'recovered';

export type ResourceLoadCacheSource =
  | 'network'
  | 'browser'
  | 'service-worker'
  | 'mf-memory'
  | 'unknown';

export type ResourceLoadErrorType =
  | 'network'
  | 'http'
  | 'content'
  | 'execution'
  | 'initialization'
  | 'timeout'
  | 'unknown';

export interface ResourceLoadRemote {
  name: string;
  alias?: string;
  version?: string;
  buildVersion?: string;
  type?: string;
  entryGlobalName?: string;
}

export interface ResourceLoadErrorSummary {
  name?: string;
  message: string;
}

export interface ResourceLoadEvent extends ResourceLoadContext {
  url: string;
  remote?: ResourceLoadRemote;
  startedAt: number;
}

export interface ResourceLoadResult extends ResourceLoadEvent {
  endedAt: number;
  duration: number;
  outcome: ResourceLoadOutcome;
  httpStatus?: number;
  mimeType?: string;
  redirected?: boolean;
  cacheSource?: ResourceLoadCacheSource;
  errorType?: ResourceLoadErrorType;
  error?: ResourceLoadErrorSummary;
}

export type PreloadAssetStatus = ResourceLoadOutcome;

export interface PreloadAssetResult {
  url: string;
  status: PreloadAssetStatus;
  resourceType: ResourceLoadType;
  initiator: ResourceLoadInitiator;
  id: string;
  startedAt?: number;
  endedAt?: number;
  duration?: number;
  cacheSource?: ResourceLoadCacheSource;
  errorType?: ResourceLoadErrorType;
  error?: unknown;
}

export interface PreloadRemoteResult {
  remote: Remote;
  remoteInfo: RemoteInfo;
  preloadConfig: PreloadConfig;
  id: string;
  results: PreloadAssetResult[];
}

export type EntryAssets = {
  name: string;
  url: string;
  moduleInfo: RemoteInfo;
};

export interface PreloadAssets {
  cssAssets: Array<string>;
  jsAssetsWithoutEntry: Array<string>;
  entryAssets: Array<EntryAssets>;
}
