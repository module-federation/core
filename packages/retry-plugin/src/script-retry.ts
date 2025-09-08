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
    let retryWrapper: any;
    let lastError: any;
    let lastRequestUrl: string | undefined;
    const {
      retryTimes = defaultRetries,
      retryDelay = defaultRetryDelay,
      domains,
      addQuery,
      onRetry,
      onSuccess,
      onError,
    } = retryOptions || {};

    let attempts = 0; // number of attempts already performed
    while (attempts < retryTimes) {
      try {
        beforeExecuteRetry();
        // Wait before retries (applies to all retries inside this loop)
        if (retryDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        // Execute this retry with the computed index (1-based)
        const retryIndex = attempts + 1;
        retryWrapper = await (retryFn as any)({
          ...params,
          getEntryUrl: (url: string) => {
            const base = lastRequestUrl || url;
            const next = getRetryUrl(base, {
              domains,
              addQuery,
              retryIndex,
              queryKey: 'retryCount',
            });
            // Announce the exact URL to be used for this retry before returning it
            onRetry &&
              onRetry({
                times: retryIndex,
                domains,
                url: next,
                tagName: 'script',
              });
            lastRequestUrl = next;
            return next;
          },
        });
        onSuccess &&
          onSuccess({ domains, url: lastRequestUrl, tagName: 'script' });
        break;
      } catch (error) {
        lastError = error;
        attempts++;
        if (attempts >= retryTimes) {
          onError &&
            lastRequestUrl &&
            onError({ domains, url: lastRequestUrl, tagName: 'script' });
          throw new Error(
            `${PLUGIN_IDENTIFIER}: The request failed and has now been abandoned`,
          );
        }
      }
    }
    return retryWrapper;
  };
}
