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
}

export type PreloadAssetStatus = 'success' | 'error' | 'timeout' | 'cached';

export interface PreloadAssetResult {
  url: string;
  status: PreloadAssetStatus;
  resourceType: ResourceLoadType;
  initiator: ResourceLoadInitiator;
  id: string;
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
