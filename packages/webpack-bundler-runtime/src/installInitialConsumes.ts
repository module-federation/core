import {
  HandleInitialConsumesOptions,
  InstallInitialConsumesOptions,
} from './types';

function handleInitialConsumes(options: HandleInitialConsumesOptions) {
  const { moduleId, moduleToHandlerMapping, webpackRequire } = options;

  const federationInstance = webpackRequire.federation.instance;
  if (!federationInstance) {
    throw new Error('Can not find federation Instance!');
  }
  const { shareKey, shareInfo } = moduleToHandlerMapping[moduleId];

  if (!shareInfo.shareConfig.eager) {
    throw new Error(
      `shared: "${shareKey}" can not be loaded synchronous while not set "eager:true" or enable async entry. `,
    );
  }
  return federationInstance.loadShareSync(shareKey);
}

export function installInitialConsumes(options: InstallInitialConsumesOptions) {
  const {
    moduleToHandlerMapping,
    webpackRequire,
    installedModules,
    initialConsumes,
  } = options;

  initialConsumes.forEach((id) => {
    webpackRequire.m[id] = (module) => {
      // Handle case when module is used sync
      installedModules[id] = 0;
      delete webpackRequire.c[id];
      const factory = handleInitialConsumes({
        moduleId: id,
        moduleToHandlerMapping,
        webpackRequire,
      });
      if (typeof factory !== 'function') {
        throw new Error(
          `Shared module is not available for eager consumption: ${id}`,
        );
      }
      module.exports = factory();
    };
  });
}
