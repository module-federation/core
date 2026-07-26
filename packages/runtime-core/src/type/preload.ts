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

export interface ResourceLoadEvent extends ResourceLoadContext {
  url: string;
  remote?: RemoteInfo;
}

export interface ResourceLoadResult extends ResourceLoadEvent {
  outcome: ResourceLoadOutcome;
  response?: Response;
  httpStatus?: number;
  mimeType?: string;
  redirected?: boolean;
  cacheSource?: ResourceLoadCacheSource;
  error?: unknown;
}

export type PreloadAssetStatus = ResourceLoadOutcome;

export interface PreloadAssetResult {
  url: string;
  status: PreloadAssetStatus;
  resourceType: ResourceLoadType;
  initiator: ResourceLoadInitiator;
  id: string;
  cacheSource?: ResourceLoadCacheSource;
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
