import { TreeShakingStatus } from '../constant';
import { RemoteEntryType, StatsAssets } from './stats';

interface BasicModuleInfo {
  dev?: {
    version?: string;
    remotes?: { [nameWithType: string]: string };
  };
  version: string;
  buildVersion: string;
  remoteTypes: string;
  remoteTypesZip: string;
  remoteTypesAPI?: string;
  remotesInfo: Record<string, { matchedVersion: string }>;
  shared: Array<{
    sharedName: string;
    fallback?: string;
    fallbackName?: string;
    fallbackType?: RemoteEntryType;
    version?: string;
    assets: StatsAssets;
    treeShakingStatus?: TreeShakingStatus;
    secondarySharedTreeShakingEntry?: string;
    secondarySharedTreeShakingName?: string;
  }>;
}

export interface BasicProviderModuleInfo extends BasicModuleInfo {
  remoteEntry: string;
  remoteEntryType: RemoteEntryType;
  // ssrRemoteEntry/ssrRemoteEntryType only appear while manifest has serveSideRemoteEntry field
  ssrRemoteEntry?: string;
  ssrRemoteEntryType?: RemoteEntryType;
  globalName: string;
  modules: Array<{
    moduleName: string;
    modulePath?: string;
    assets: StatsAssets;
  }>;
  prefetchInterface?: boolean;
  // @deprecated
  prefetchEntry?: string;
  // @deprecated
  prefetchEntryType?: RemoteEntryType;
}

interface BasicProviderModuleInfoWithPublicPath extends BasicProviderModuleInfo {
  publicPath: string;
  ssrPublicPath?: string;
}

interface BasicProviderModuleInfoWithGetPublicPath extends BasicProviderModuleInfo {
  getPublicPath: string;
}

export interface ManifestProvider {
  remoteEntry: string;
  ssrRemoteEntry?: string;
  version?: string;
}

export interface PureEntryProvider extends ManifestProvider {
  globalName: string;
}

interface BasicConsumerModuleInfo extends BasicModuleInfo {
  consumerList: Array<string>;
}

export interface ConsumerModuleInfoWithPublicPath
  extends BasicConsumerModuleInfo, BasicProviderModuleInfo {
  publicPath: string;
  ssrPublicPath?: string;
}

interface ConsumerModuleInfoWithGetPublicPath
  extends BasicConsumerModuleInfo, BasicProviderModuleInfo {
  getPublicPath: string;
}

export type PureConsumerModuleInfo = Omit<
  BasicConsumerModuleInfo,
  'remoteTypes'
>;

export type ConsumerModuleInfo =
  | ConsumerModuleInfoWithPublicPath
  | ConsumerModuleInfoWithGetPublicPath;

export type ProviderModuleInfo =
  | BasicProviderModuleInfoWithPublicPath
  | BasicProviderModuleInfoWithGetPublicPath;

export type ModuleInfo =
  | ConsumerModuleInfo
  | PureConsumerModuleInfo
  | ProviderModuleInfo;

export interface GlobalModuleInfoExtendInfos {
  version?: string;
  overrides?: Record<string, string>;
  region?: string;
  grayscale?: number | string;
  versionResolvedFromTag?: Array<{
    moduleName: string;
    tagName: string;
    resolvedVersion: string;
  }>;
  dynamicModulesInfo?: Record<
    string,
    {
      version?: string;
      alias?: string;
      consumeMode?: string;
      route?: string;
      exposesPathForLoadRemote?: string;
      props?: string;
      [key: string]: unknown;
    }
  >;
  dynamicVersionsInfo?: Record<
    string,
    {
      hostName: string;
      dynamicVersionModules: Record<
        string,
        {
          version: string;
          consumeMode?: string;
          [key: string]: unknown;
        }
      >;
    }
  >;
  [key: string]: unknown;
}

export type GlobalModuleInfo = {
  [key in string]: key extends 'extendInfos'
    ? GlobalModuleInfoExtendInfos
    : key extends 'res'
      ? unknown
      : ModuleInfo | ManifestProvider | PureEntryProvider | undefined;
};
