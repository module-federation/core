import {
  IdToRemoteMapItem,
  RemotesOptions,
  InstallInitialConsumesOptions,
  ConsumesOptions,
} from './types';

export function updateConsumeOptions(
  options: InstallInitialConsumesOptions | ConsumesOptions,
) {
  const { webpackRequire, moduleToHandlerMapping } = options;
  const { consumesLoadingData } = webpackRequire;
  if (!consumesLoadingData) {
    return;
  }

  const {
    moduleIdToConsumeDataMapping: updatedModuleIdToConsumeDataMapping = {},
    initialConsumes: updatedInitialConsumes = [],
    chunkMapping: updatedChunkMapping = {},
  } = consumesLoadingData;

  Object.entries(updatedModuleIdToConsumeDataMapping).forEach(([id, data]) => {
    if (!moduleToHandlerMapping[id]) {
      moduleToHandlerMapping[id] = data;
    }
  });

  if ('initialConsumes' in options) {
    const { initialConsumes = [] } = options;
    updatedInitialConsumes.forEach((id) => {
      if (!initialConsumes.includes(id)) {
        initialConsumes.push(id);
      }
    });
  }

  if ('chunkMapping' in options) {
    const { chunkMapping = {} } = options;
    Object.entries(updatedChunkMapping).forEach(([id, chunkModules]) => {
      if (!chunkMapping[id]) {
        chunkMapping[id] = [];
      }
      chunkModules.forEach((moduleId) => {
        if (!chunkMapping[id].includes(moduleId)) {
          chunkMapping[id].push(moduleId);
        }
      });
    });
  }
}

export function updateRemoteOptions(options: RemotesOptions) {
  const {
    webpackRequire,
    idToExternalAndNameMapping = {},
    idToRemoteMap = {},
    chunkMapping = {},
  } = options;
  const { remotesLoadingData } = webpackRequire;
  const remoteInfos =
    webpackRequire.federation?.bundlerRuntimeOptions?.remotes?.remoteInfos;
  if (!remotesLoadingData || !remoteInfos) {
    return;
  }
  const { chunkMapping: updatedChunkMapping, moduleIdToRemoteDataMapping } =
    remotesLoadingData;
  if (!updatedChunkMapping || !moduleIdToRemoteDataMapping) {
    return;
  }
  for (let [moduleId, data] of Object.entries(moduleIdToRemoteDataMapping)) {
    if (!idToExternalAndNameMapping[moduleId]) {
      idToExternalAndNameMapping[moduleId] = [
        data.shareScope,
        data.name,
        data.externalModuleId,
      ];
    }
    if (!idToRemoteMap[moduleId] && remoteInfos[data.remoteName]) {
      const items = remoteInfos[data.remoteName];
      idToRemoteMap[moduleId] ||= [];
      items.forEach((item) => {
        if (!idToRemoteMap[moduleId].includes(item)) {
          idToRemoteMap[moduleId].push(item);
        }
      });
    }
  }

  if (chunkMapping) {
    Object.entries(updatedChunkMapping).forEach(([id, chunkModules]) => {
      if (!chunkMapping[id]) {
        chunkMapping[id] = [];
      }
      chunkModules.forEach((moduleId) => {
        if (!chunkMapping[id].includes(moduleId)) {
          chunkMapping[id].push(moduleId);
        }
      });
    });
  }
}
