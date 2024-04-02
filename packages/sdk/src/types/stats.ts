import { MFModuleType } from '../constant';
import type { RemoteWithEntry, RemoteWithVersion } from './common';

export type RemoteEntryType = 'esm' | 'global';

interface ResourceInfo {
  path: string;
  name: string;
  type: RemoteEntryType;
}

export interface StatsBuildInfo {
  buildVersion: string;
  buildName: string;
}

export interface MetaDataTypes {
  path: string;
  name: string;
  api: string;
  zip: string;
}

export interface BasicStatsMetaData {
  name: string;
  globalName: string;
  buildInfo: StatsBuildInfo;
  remoteEntry: ResourceInfo;
  prefetchInterface?: boolean;
  prefetchEntry?: ResourceInfo;
  types: MetaDataTypes;
  type: string;
  pluginVersion: string;
}

type StatsMetaDataWithGetPublicPath<T = BasicStatsMetaData> = T & {
  getPublicPath: string;
};

type StatsMetaDataWithPublicPath<T = BasicStatsMetaData> = T & {
  publicPath: string;
};

export type StatsMetaData<T = BasicStatsMetaData> =
  | StatsMetaDataWithGetPublicPath<T>
  | StatsMetaDataWithPublicPath<T>;

export interface StatsAssets {
  js: StatsAssetsInfo;
  css: StatsAssetsInfo;
}

interface StatsAssetsInfo {
  sync: string[];
  async: string[];
}

export interface StatsShared {
  id: string;
  name: string;
  version: string;
  singleton: boolean;
  requiredVersion: string;
  hash: string;
  assets: StatsAssets;
  deps: string[];
  usedIn: string[];
}
// extends Omit<RemoteEntryInfo, 'name'>
export interface StatsRemoteVal {
  moduleName: string;
  federationContainerName: string;
  consumingFederationContainerName: string;
  alias: string;
  usedIn: string[];
}

export type StatsRemoteWithEntry<T = StatsRemoteVal> = T &
  Omit<RemoteWithEntry, 'name'>;
export type StatsRemoteWithVersion<T = StatsRemoteVal> = T &
  Omit<RemoteWithVersion, 'name'>;

export type StatsRemote<T = StatsRemoteVal> =
  | StatsRemoteWithEntry<T>
  | StatsRemoteWithVersion<T>;

export interface StatsModuleInfo {
  name: string;
  file: string[];
}

export interface ManifestModuleInfos {
  [exposeModuleName: string]: StatsModuleInfo;
}

export interface StatsExpose {
  id: string;
  name: string;
  path?: string;
  file: string;
  requires: string[];
  assets: StatsAssets;
}

export interface Stats<T = BasicStatsMetaData, K = StatsRemoteVal> {
  id: string;
  name: string;
  metaData: StatsMetaData<T>;
  shared: StatsShared[];
  remotes: StatsRemote<K>[];
  exposes: StatsExpose[];
}
