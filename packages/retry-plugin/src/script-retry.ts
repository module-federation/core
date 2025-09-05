import {
  defaultRetries,
  defaultRetryDelay,
  PLUGIN_IDENTIFIER,
} from './constant';
import type { ScriptRetryOptions } from './types';
import logger from './logger';
import { getRetryUrl } from './utils';

export function scriptRetry<T extends Record<string, any>>({
  retryOptions,
  retryFn,
  beforeExecuteRetry = () => {},
}: ScriptRetryOptions) {
  return async function (params: T) {
    let retryWrapper;
    const {
      retryTimes = defaultRetries,
      retryDelay = defaultRetryDelay,
      domains,
      addQuery,
      onRetry,
      onSuccess,
      onError,
    } = retryOptions || {};

    let attempts = 0;
    while (attempts < retryTimes) {
      try {
        beforeExecuteRetry();
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        const retryIndex = attempts + 1;
        retryWrapper = await (retryFn as any)({
          ...params,
          getEntryUrl: (url: string) => {
            return getRetryUrl(url, {
              domains,
              addQuery,
              retryIndex,
              queryKey: 'retryCount',
            });
          },
        });
        onSuccess && onSuccess({ domains, tagName: 'script' });
        break;
      } catch (error) {
        attempts++;
        if (attempts < retryTimes) {
          onRetry && onRetry({ times: attempts, domains, tagName: 'script' });
          logger.log(
            `${PLUGIN_IDENTIFIER}: script resource retrying ${attempts} times`,
          );
        } else {
          onError && onError({ domains, tagName: 'script' });
          throw error;
        }
      }
    }
    return retryWrapper;
  };
}
