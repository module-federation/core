import type { FetchWithRetryOptions } from './types';
import {
  defaultRetries,
  defaultRetryDelay,
  PLUGIN_IDENTIFIER,
} from './constant';
import logger from './logger';

async function fetchWithRetry(params: FetchWithRetryOptions) {
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
  const retryPath = getRetryPath ? getRetryPath(url) : url;
  try {
    const response = await fetch(retryPath, options);
    const responseClone = response.clone();

    if (!response.ok) {
      throw new Error(`Server error：${response.status}`);
    }

    await responseClone.json().catch((error) => {
      throw new Error(`Json parse error: ${error}, url is: ${retryPath}`);
    });

    return response;
  } catch (error) {
    if (retryTimes <= 0) {
      logger.log(
        `${PLUGIN_IDENTIFIER}: retry failed after ${retryTimes} times for url: ${retryPath}, now will try fallbackUrl url`,
      );

      if (retryPath && fallback && typeof fallback === 'function') {
        return fetchWithRetry({
          manifestUrl: fallback(retryPath),
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
      return await fetchWithRetry({
        ...params,
        retryTimes: retryTimes - 1,
      });
    }
  }
}

export { fetchWithRetry };
