import {
  defaultRetries,
  defaultRetryDelay,
  PLUGIN_IDENTIFIER,
} from './constant';
import type { ScriptCommonRetryOption } from './types';
import logger from './logger';

export function scriptRetry<T extends Record<string, any>>({
  scriptOption,
  moduleInfo,
  retryFn,
  beforeExecuteRetry = () => {},
}: ScriptCommonRetryOption) {
  return async function (params: T) {
    let retryWrapper;
    const { retryTimes = defaultRetries, retryDelay = defaultRetryDelay } =
      scriptOption || {};

    const shouldRetryThisModule = shouldRetryModule(scriptOption, moduleInfo);
    if (shouldRetryThisModule) {
      let attempts = 0;
      while (attempts < retryTimes) {
        try {
          beforeExecuteRetry();
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          retryWrapper = await (retryFn as any)({
            ...params,
            // add getRetryPath to load entry url passed by user
            getEntryUrl: scriptOption?.getRetryPath,
          });
          break;
        } catch (error) {
          attempts++;
          if (attempts < retryTimes) {
            logger.log(
              `${PLUGIN_IDENTIFIER}: script resource retrying ${attempts} times`,
            );
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          } else {
            scriptOption?.cb &&
              (await new Promise(
                (resolve) =>
                  scriptOption?.cb && scriptOption?.cb(resolve, error),
              ));
            throw error;
          }
        }
      }
    }
    return retryWrapper;
  };
}

function shouldRetryModule(scriptOption: any, moduleInfo: any): boolean {
  // if not configured moduleName, retry all modules
  if (!scriptOption?.moduleName) {
    return true;
  }

  // if configured moduleName, check if the current module is in the retry list
  const moduleNames = scriptOption.moduleName;
  const currentModuleName = moduleInfo.name;
  const currentModuleAlias = moduleInfo?.alias;

  return moduleNames.some(
    (targetName: string) =>
      targetName === currentModuleName || targetName === currentModuleAlias,
  );
}
