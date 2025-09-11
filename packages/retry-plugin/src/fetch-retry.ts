import type { FetchRetryOptions } from './types';
import {
  defaultRetries,
  defaultRetryDelay,
  PLUGIN_IDENTIFIER,
  ERROR_ABANDONED,
} from './constant';
import logger from './logger';
import { getRetryUrl, combineUrlDomainWithPathQuery } from './utils';

async function fetchRetry(
  params: FetchRetryOptions,
  lastRequestUrl?: string,
  originalTotal?: number,
) {
  const {
    url,
    fetchOptions = {},
    retryTimes = defaultRetries,
    retryDelay = defaultRetryDelay,
    // List of retry domains when resource loading fails. In the domains array, the first item is the default domain for static resources, and the subsequent items are backup domains. When a request to a domain fails, the system will find that domain in the array and replace it with the next domain in the array.
    domains,
    // Whether to add query parameters during resource retry to avoid being affected by browser and CDN cache. When set to true, retry=${times} will be added to the query, requesting in the order of retry=1, retry=2, retry=3.
    addQuery,
    onRetry,
    onSuccess,
    onError,
  } = params;

  if (!url) {
    throw new Error(`${PLUGIN_IDENTIFIER}: url is required in fetchWithRetry`);
  }

  const total = originalTotal ?? params.retryTimes ?? defaultRetries;
  const isFirstAttempt = !lastRequestUrl;

  // For domain rotation, use the last request URL to determine current domain,
  // but clean it of query parameters to prevent accumulation
  let baseUrl = url;
  if (!isFirstAttempt && lastRequestUrl) {
    // Extract the domain/host info from lastRequestUrl but use original URL's path and query
    baseUrl = combineUrlDomainWithPathQuery(lastRequestUrl, url);
  }

  let requestUrl = baseUrl;
  if (!isFirstAttempt) {
    requestUrl = getRetryUrl(baseUrl, {
      domains,
      addQuery,
      retryIndex: total - retryTimes,
      queryKey: 'retryCount',
    });
  }
  try {
    if (!isFirstAttempt && retryDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
    const response = await fetch(requestUrl, fetchOptions);
    const responseClone = response.clone();
    if (!response.ok) {
      throw new Error(
        `${PLUGIN_IDENTIFIER}: Request failed: ${response.status} ${response.statusText || ''} | url: ${requestUrl}`,
      );
    }
    await responseClone.json().catch((error) => {
      throw new Error(
        `${PLUGIN_IDENTIFIER}: JSON parse failed: ${(error as Error)?.message || String(error)} | url: ${requestUrl}`,
      );
    });

    if (!isFirstAttempt) {
      onSuccess &&
        requestUrl &&
        onSuccess({ domains, url: requestUrl, tagName: 'fetch' });
    }
    return response;
  } catch (error) {
    if (retryTimes <= 0) {
      const attemptedRetries = total - retryTimes;
      if (!isFirstAttempt && attemptedRetries > 0) {
        onError && onError({ domains, url: requestUrl, tagName: 'fetch' });
        logger.log(
          `${PLUGIN_IDENTIFIER}: retry failed, no retries left for url: ${requestUrl}`,
        );
      }
      throw new Error(`${PLUGIN_IDENTIFIER}: ${ERROR_ABANDONED}`);
    } else {
      // Prepare next retry using the same domain extraction logic
      const nextIndex = total - retryTimes + 1; // upcoming retry count

      // For prediction, use current request URL's domain but original URL's path/query
      const predictedBaseUrl = combineUrlDomainWithPathQuery(requestUrl, url);

      const predictedNextUrl = getRetryUrl(predictedBaseUrl, {
        domains,
        addQuery,
        retryIndex: nextIndex,
        queryKey: 'retryCount',
      });
      onRetry &&
        onRetry({
          times: nextIndex,
          domains,
          url: predictedNextUrl,
          tagName: 'fetch',
        });
      logger.log(
        `${PLUGIN_IDENTIFIER}: Trying again. Number of retries left: ${retryTimes - 1}`,
      );
      return await fetchRetry(
        {
          ...params,
          retryTimes: retryTimes - 1,
        },
        requestUrl,
        total,
      );
    }
  }
}

export { fetchRetry };
