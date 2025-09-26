import {
  RemoteChunkMapping,
  WebpackRequire,
  IdToRemoteMap,
  IdToRemoteMapItem,
  ModuleId,
  RemoteDataItem,
  RemoteInfos,
  RemotesOptions,
  CoreRemotesOptions,
  IdToExternalAndNameMapping,
} from './types';

export function getRemoteChunkMapping(
  webpackRequire: WebpackRequire,
): RemoteChunkMapping | void {
  return webpackRequire?.remotesLoadingData?.chunkMapping;
}

export function getCoreRemotesOptions(
  webpackRequire: WebpackRequire,
  remotesOptions: CoreRemotesOptions,
): Required<CoreRemotesOptions> {
  const remoteInfos =
    webpackRequire.federation?.bundlerRuntimeOptions?.remotes?.remoteInfos;
  // means use latest rspack
  if (remoteInfos) {
    const chunkMapping = getRemoteChunkMapping(webpackRequire);
    if (
      !chunkMapping ||
      !webpackRequire?.remotesLoadingData?.moduleIdToRemoteDataMapping
    ) {
      return {
        chunkMapping: chunkMapping || {},
        idToExternalAndNameMapping: {},
        idToRemoteMap: {},
      };
    }
    const idToExternalAndNameMapping: IdToExternalAndNameMapping = {};
    const idToRemoteMap: IdToRemoteMap = {};

    const moduleIdToRemoteDataMapping =
      webpackRequire.remotesLoadingData.moduleIdToRemoteDataMapping;
    for (let [moduleId, data] of Object.entries(moduleIdToRemoteDataMapping)) {
      idToExternalAndNameMapping[moduleId] = [
        data.shareScope,
        data.name,
        data.externalModuleId,
      ];
      if (remoteInfos[data.remoteName]) {
        const item = remoteInfos[data.remoteName];
        idToRemoteMap[moduleId] ||= [];
        idToRemoteMap[moduleId].push(item as unknown as IdToRemoteMapItem);
      }
    }
    return {
      chunkMapping,
      idToExternalAndNameMapping,
      idToRemoteMap,
    };
  }
  const {
    chunkMapping = {},
    idToExternalAndNameMapping = {},
    idToRemoteMap = {},
  } = remotesOptions;
  return {
    chunkMapping,
    idToExternalAndNameMapping,
    idToRemoteMap,
  };
}
