import {
  HandleInitialConsumesOptions,
  InstallInitialConsumesOptions,
} from './types';
import { updateConsumeOptions } from './updateOptions';
function handleInitialConsumes(options: HandleInitialConsumesOptions) {
  const { moduleId, moduleToHandlerMapping, webpackRequire } = options;

  const federationInstance = webpackRequire.federation.instance;
  if (!federationInstance) {
    throw new Error('Federation instance not found!');
  }
  const { shareKey, shareInfo } = moduleToHandlerMapping[moduleId];

  try {
    return federationInstance.loadShareSync(shareKey, {
      customShareInfo: shareInfo,
    });
  } catch (err) {
    console.error(
      'loadShareSync failed! The function should not be called unless you set "eager:true". If you do not set it, and encounter this issue, you can check whether an async boundary is implemented.',
    );
    console.error('The original error message is as follows: ');
    throw err;
  }
}

export function installInitialConsumes(options: InstallInitialConsumesOptions) {
  const { webpackRequire } = options;

  updateConsumeOptions(options);
  const { initialConsumes, moduleToHandlerMapping, installedModules } = options;

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
      const result = factory();
      // Add layer property from shareConfig if available
      const { shareInfo } = moduleToHandlerMapping[id];
      if (
        shareInfo?.shareConfig?.layer &&
        result &&
        typeof result === 'object'
      ) {
        try {
          // Only set layer if it's not already defined or if it's undefined
          if (
            !result.hasOwnProperty('layer') ||
            (result as any).layer === undefined
          ) {
            (result as any).layer = shareInfo.shareConfig.layer;
          }
        } catch (e) {
          // Ignore if layer property is read-only
        }
      }
      module.exports = result;
    };
  });
}
