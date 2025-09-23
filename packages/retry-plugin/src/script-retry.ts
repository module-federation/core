import {
  defaultRetries,
  defaultRetryDelay,
  PLUGIN_IDENTIFIER,
  ERROR_ABANDONED,
} from './constant';
import type { ScriptRetryOptions } from './types';
import logger from './logger';
import { getRetryUrl, combineUrlDomainWithPathQuery } from './utils';

export function scriptRetry<T extends Record<string, any>>({
  retryOptions,
  retryFn,
  beforeExecuteRetry = () => {},
}: ScriptRetryOptions) {
  return async function (params: T) {
    let retryWrapper: any;
    let lastError: any;
    let lastRequestUrl: string | undefined;
    let originalUrl: string | undefined;
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
    const maxAttempts = retryTimes; // maximum number of attempts allowed

    while (attempts < maxAttempts) {
      try {
        beforeExecuteRetry();
        if (retryDelay > 0 && attempts > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        const retryIndex = attempts + 1;
        retryWrapper = await (retryFn as any)({
          ...params,
          getEntryUrl: (url: string) => {
            // Store the original URL on first call
            if (!originalUrl) {
              originalUrl = url;
            }

            // For domain rotation, use the domain from last request but path/query from original URL
            // This prevents query parameter accumulation while allowing domain rotation
            let baseUrl = originalUrl;
            if (lastRequestUrl) {
              baseUrl = combineUrlDomainWithPathQuery(
                lastRequestUrl,
                originalUrl,
              );
            }

            const next = getRetryUrl(baseUrl, {
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
          lastRequestUrl &&
          onSuccess({ domains, url: lastRequestUrl, tagName: 'script' });
        break;
      } catch (error) {
        lastError = error;
        attempts++;
        if (attempts >= maxAttempts) {
          onError &&
            lastRequestUrl &&
            onError({ domains, url: lastRequestUrl, tagName: 'script' });

          throw new Error(
            `${PLUGIN_IDENTIFIER}: ${ERROR_ABANDONED} | url: ${lastRequestUrl || 'unknown'}`,
          );
        }
      }
    }
    return retryWrapper;
  };
}
