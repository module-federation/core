import { ConsumesOptions } from './types';
import { attachShareScopeMap } from './attachShareScopeMap';
import { updateConsumeOptions } from './updateOptions';
import { getUsedExports } from './getUsedExports';
import type { Shared } from '@module-federation/runtime/types';

export function consumes(options: ConsumesOptions) {
  updateConsumeOptions(options);
  const {
    chunkId,
    promises,
    installedModules,
    webpackRequire,
    chunkMapping,
    moduleToHandlerMapping,
  } = options;

  attachShareScopeMap(webpackRequire);
  if (webpackRequire.o(chunkMapping, chunkId)) {
    chunkMapping[chunkId].forEach((id) => {
      if (webpackRequire.o(installedModules, id)) {
        return promises.push(installedModules[id] as Promise<any>);
      }
      const onFactory = (factory: () => any) => {
        installedModules[id] = 0;
        webpackRequire.m[id] = (module) => {
          delete webpackRequire.c[id];
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
      const onError = (error: unknown) => {
        delete installedModules[id];
        webpackRequire.m[id] = (module) => {
          delete webpackRequire.c[id];
          throw error;
        };
      };
      try {
        const federationInstance = webpackRequire.federation.instance;
        if (!federationInstance) {
          throw new Error('Federation instance not found!');
        }
        const { shareKey, getter, shareInfo, treeshakeGetter } =
          moduleToHandlerMapping[id];
        const usedExports = getUsedExports(webpackRequire, shareKey);
        const customShareInfo: Partial<Shared> = { ...shareInfo };
        if (usedExports) {
          customShareInfo.treeshake = {
            usedExports,
            useIn: [federationInstance.options.name],
          };
        }
        const promise = federationInstance
          .loadShare(shareKey, {
            customShareInfo,
          })
          .then((factory: any) => {
            if (factory === false) {
              return treeshakeGetter?.() || getter();
            }
            return factory;
          });

        if (promise.then) {
          promises.push(
            (installedModules[id] = promise.then(onFactory).catch(onError)),
          );
        } else {
          // @ts-ignore maintain previous logic
          onFactory(promise);
        }
      } catch (e) {
        onError(e);
      }
    });
  }
}
