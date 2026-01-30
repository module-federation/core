import type {
  IdToRemoteMapItem,
  RemotesOptions,
  InstallInitialConsumesOptions,
  ConsumesOptions,
} from './types';
import type {
  UserOptions,
  ShareArgs,
  SharedConfig,
} from '@module-federation/runtime/types';

export function updateConsumeOptions(
  options: InstallInitialConsumesOptions | ConsumesOptions,
) {
  const { webpackRequire, moduleToHandlerMapping } = options;
  const { consumesLoadingData, initializeSharingData } = webpackRequire;
  const { sharedFallback, bundlerRuntime, libraryType } =
    webpackRequire.federation;
  if (consumesLoadingData && !consumesLoadingData._updated) {
    const {
      moduleIdToConsumeDataMapping: updatedModuleIdToConsumeDataMapping = {},
      initialConsumes: updatedInitialConsumes = [],
      chunkMapping: updatedChunkMapping = {},
    } = consumesLoadingData;

    Object.entries(updatedModuleIdToConsumeDataMapping).forEach(
      ([id, data]) => {
        if (!moduleToHandlerMapping[id]) {
          moduleToHandlerMapping[id] = {
            // @ts-ignore
            getter: sharedFallback
              ? bundlerRuntime?.getSharedFallbackGetter({
                  shareKey: data.shareKey,
                  factory: data.fallback,
                  webpackRequire,
                  libraryType,
                })
              : data.fallback,
            treeShakingGetter: sharedFallback ? data.fallback : undefined,
            shareInfo: {
              shareConfig: {
                requiredVersion: data.requiredVersion,
                strictVersion: data.strictVersion,
                singleton: data.singleton,
                eager: data.eager,
                layer: data.layer,
              },
              scope: Array.isArray(data.shareScope)
                ? data.shareScope
                : [data.shareScope || 'default'],
              treeShaking: sharedFallback
                ? {
                    get: data.fallback,
                    mode: data.treeShakingMode,
                  }
                : undefined,
            },
            shareKey: data.shareKey,
          };
        }
      },
    );

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
    consumesLoadingData._updated = 1;
  }

  if (initializeSharingData && !initializeSharingData._updated) {
    const { federation } = webpackRequire;
    if (
      !federation.instance ||
      !initializeSharingData.scopeToSharingDataMapping
    ) {
      return;
    }
    const shared: Record<string, Array<ShareArgs>> = {};
    for (let [scope, stages] of Object.entries(
      initializeSharingData.scopeToSharingDataMapping,
    )) {
      for (let stage of stages) {
        if (typeof stage === 'object' && stage !== null) {
          const {
            name,
            version,
            factory,
            eager,
            singleton,
            requiredVersion,
            strictVersion,
          } = stage;
          const shareConfig: SharedConfig = {
            requiredVersion: `^${version}`,
          };
          const isValidValue = function (
            val: unknown,
          ): val is NonNullable<unknown> {
            return typeof val !== 'undefined';
          };
          if (isValidValue(singleton)) {
            shareConfig.singleton = singleton;
          }
          if (isValidValue(requiredVersion)) {
            shareConfig.requiredVersion = requiredVersion;
          }
          if (isValidValue(eager)) {
            shareConfig.eager = eager;
          }
          if (isValidValue(strictVersion)) {
            shareConfig.strictVersion = strictVersion;
          }
          const options = {
            version,
            scope: [scope],
            shareConfig,
            get: factory,
          };
          if (shared[name]) {
            shared[name].push(options);
          } else {
            shared[name] = [options];
          }
        }
      }
    }
    federation.instance.registerShared(shared);
    initializeSharingData._updated = 1;
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
  if (!remotesLoadingData || remotesLoadingData._updated || !remoteInfos) {
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
  remotesLoadingData._updated = 1;
}
