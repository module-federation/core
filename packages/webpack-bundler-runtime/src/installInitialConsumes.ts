import {
  HandleInitialConsumesOptions,
  InstallInitialConsumesOptions,
} from './types';
function handleInitialConsumes(options: HandleInitialConsumesOptions) {
  const { moduleId, moduleToHandlerMapping, webpackRequire } = options;

  const federationInstance = webpackRequire.federation.instance;
  if (!federationInstance) {
    throw new Error('Federation instance not found!');
  }
  const { shareKey, shareInfo } = moduleToHandlerMapping[moduleId];

  return federationInstance.loadShareSync(shareKey, shareInfo);
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
      // Handle scenario when module is used synchronously
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
