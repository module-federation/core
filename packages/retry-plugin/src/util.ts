import {
  defaultRetries,
  defaultRetryDelay,
  PLUGIN_IDENTIFIER,
} from './constant';
import type { ScriptCommonRetryOption } from './types';
import logger from './logger';

export function scriptCommonRetry<T extends (...args: any[]) => void>({
  scriptOption,
  moduleInfo,
  retryFn,
  beforeExecuteRetry = () => {},
}: ScriptCommonRetryOption) {
  return async function (...args: Parameters<T>) {
    let retryResponse;
    const { retryTimes = defaultRetries, retryDelay = defaultRetryDelay } =
      scriptOption || {};
    if (
      (scriptOption?.moduleName &&
        scriptOption?.moduleName.some(
          (m) => moduleInfo.name === m || moduleInfo?.alias === m,
        )) ||
      scriptOption?.moduleName === undefined
    ) {
      let attempts = 0;
      while (attempts - 1 < retryTimes) {
        try {
          beforeExecuteRetry();
          retryResponse = await retryFn(...args);
          break;
        } catch (error) {
          attempts++;
          if (attempts - 1 >= retryTimes) {
            scriptOption?.cb &&
              (await new Promise(
                (resolve) =>
                  scriptOption?.cb && scriptOption?.cb(resolve, error),
              ));
            throw error;
          }
          logger.log(
            `${PLUGIN_IDENTIFIER}: script resource retrying ${attempts} times`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }
    return retryResponse;
  };
}
