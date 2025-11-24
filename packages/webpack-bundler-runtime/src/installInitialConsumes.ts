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
      let moduleExports = result;
      if (
        result &&
        typeof result === 'object' &&
        (result as any)[Symbol.toStringTag] === 'Module'
      ) {
        try {
          const defaultExport = (result as any).default;
          // Only unwrap if default export is an object or function
          // For primitives, keep the original ESM namespace to preserve named exports
          if (
            defaultExport &&
            (typeof defaultExport === 'object' ||
              typeof defaultExport === 'function')
          ) {
            moduleExports = defaultExport;
            // Copy named exports to the unwrapped default
            for (const key in result) {
              if (key !== 'default' && !(key in (moduleExports as any))) {
                Object.defineProperty(moduleExports as any, key, {
                  enumerable: true,
                  get: () => (result as any)[key],
                });
              }
            }
            // Add circular reference for ESM interop
            (moduleExports as any).default = moduleExports;
          }
          // If default is primitive, keep original result to preserve named exports
        } catch (e) {
          moduleExports = result;
        }
      }

      // Add layer property from shareConfig if available
      const { shareInfo } = moduleToHandlerMapping[id];
      if (
        shareInfo?.shareConfig?.layer &&
        moduleExports &&
        typeof moduleExports === 'object'
      ) {
        try {
          // Only set layer if it's not already defined or if it's undefined
          if (
            !moduleExports.hasOwnProperty('layer') ||
            (moduleExports as any).layer === undefined
          ) {
            (moduleExports as any).layer = shareInfo.shareConfig.layer;
          }
        } catch (e) {
          // Ignore if layer property is read-only
        }
      }
      module.exports = moduleExports;
    };
  });
}
