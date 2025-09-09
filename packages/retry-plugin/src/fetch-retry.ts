import type { FetchWithRetryOptions } from './types';
import {
  defaultRetries,
  defaultRetryDelay,
  PLUGIN_IDENTIFIER,
} from './constant';
import logger from './logger';

async function fetchWithRetry(
  params: FetchWithRetryOptions,
  userOriginalRetryTimes?: number,
) {
  const {
    manifestUrl,
    options = {},
    retryTimes = defaultRetries,
    retryDelay = defaultRetryDelay,
    fallback,
    getRetryPath,
  } = params;

  const url = manifestUrl || (params as any).url;
  if (!url) {
    throw new Error('[retry-plugin] manifestUrl or url is required');
  }

  // check if it's a retry process: if retryTimes is not equal to userOriginalRetryTimes, it's a retry process
  const originalRetryTimes =
    userOriginalRetryTimes ?? params.retryTimes ?? defaultRetries;
  const isRetry = retryTimes !== originalRetryTimes;
  const retryUrl = isRetry && getRetryPath ? getRetryPath(url) : null;
  const requestUrl = retryUrl || url;
  try {
    const response = await fetch(requestUrl, options);
    const responseClone = response.clone();

    if (!response.ok) {
      throw new Error(`Server error：${response.status}`);
    }

    await responseClone.json().catch((error) => {
      throw new Error(`Json parse error: ${error}, url is: ${requestUrl}`);
    });

    return response;
  } catch (error) {
    if (retryTimes <= 0) {
      logger.log(
        `${PLUGIN_IDENTIFIER}: retry failed after ${defaultRetries} times for url: ${requestUrl}, now will try fallbackUrl url`,
      );

      if (requestUrl && fallback && typeof fallback === 'function') {
        return fetchWithRetry({
          manifestUrl: fallback(requestUrl),
          options,
          retryTimes: 0,
          retryDelay: 0,
        });
      }

      if (
        error instanceof Error &&
        error.message.includes('Json parse error')
      ) {
        throw error;
      }

      throw new Error(
        `${PLUGIN_IDENTIFIER}: The request failed three times and has now been abandoned`,
      );
    } else {
      retryDelay > 0 &&
        (await new Promise((resolve) => setTimeout(resolve, retryDelay)));

      logger.log(
        `Trying again. Number of retries available：${retryTimes - 1}`,
      );
      return await fetchWithRetry(
        {
          ...params,
          retryTimes: retryTimes - 1,
        },
        originalRetryTimes,
      );
    }
  }
}

export { fetchWithRetry };
