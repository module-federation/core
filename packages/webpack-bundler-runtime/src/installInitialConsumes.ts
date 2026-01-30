import { getUsedExports } from './getUsedExports';
import {
  HandleInitialConsumesOptions,
  InstallInitialConsumesOptions,
} from './types';
import type { Shared } from '@module-federation/runtime/types';
import { updateConsumeOptions } from './updateOptions';

function handleInitialConsumes(options: HandleInitialConsumesOptions) {
  const { moduleId, moduleToHandlerMapping, webpackRequire, asyncLoad } =
    options;

  const federationInstance = webpackRequire.federation.instance;
  if (!federationInstance) {
    throw new Error('Federation instance not found!');
  }
  const { shareKey, shareInfo } = moduleToHandlerMapping[moduleId];

  try {
    const usedExports = getUsedExports(webpackRequire, shareKey);

    const customShareInfo: Partial<Shared> = { ...shareInfo };
    if (usedExports) {
      customShareInfo.treeShaking = {
        usedExports,
        useIn: [federationInstance.options.name],
      };
    }
    if (asyncLoad) {
      return federationInstance.loadShare(shareKey, {
        customShareInfo,
      });
    }
    return federationInstance.loadShareSync(shareKey, {
      customShareInfo,
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
  updateConsumeOptions(options);

  const {
    moduleToHandlerMapping,
    webpackRequire,
    installedModules,
    initialConsumes,
    asyncLoad,
  } = options;

  const factoryIdSets: Array<
    [string | number, () => Promise<false | (() => unknown)> | (() => unknown)]
  > = [];
  initialConsumes.forEach((id) => {
    const factoryGetter = () =>
      handleInitialConsumes({
        moduleId: id,
        moduleToHandlerMapping,
        webpackRequire,
        asyncLoad,
      }) as Promise<false | (() => unknown)>;
    factoryIdSets.push([id, factoryGetter]);
  });

  const setModule = (
    id: string | number,
    factoryGetter: () => () => unknown,
  ) => {
    webpackRequire.m[id] = (module) => {
      // Handle scenario when module is used synchronously
      installedModules[id] = 0;
      delete webpackRequire.c[id];

      const factory = factoryGetter();
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
  };

  if (asyncLoad) {
    return Promise.all(
      factoryIdSets.map(async ([id, factoryGetter]) => {
        const result = await factoryGetter();
        setModule(id, () => result as () => unknown);
      }),
    );
  }
  factoryIdSets.forEach(([id, factoryGetter]) => {
    setModule(id, factoryGetter as () => () => unknown);
  });
}
