import type { FetchRetryOptions } from './types';
import {
  defaultRetries,
  defaultRetryDelay,
  PLUGIN_IDENTIFIER,
} from './constant';
import logger from './logger';
import { getRetryUrl } from './utils';

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
    // 指定资源加载失败时的重试域名列表。在 domain 数组中，第一项是静态资源默认所在的域名，后面几项为备用域名。当某个域名的资源请求失败时，Rsbuild 会在数组中找到该域名，并替换为数组的下一个域名。
    domains,
    // 是否在资源重试时添加 query，这样可以避免被浏览器、CDN 缓存影响到重试的结果。当设置为 true 时，请求时会在 query 中添加 retry=${times}，按照 retry=1，retry=2，retry=3 依次请求
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
  const baseUrl = lastRequestUrl || url;

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

    onSuccess && onSuccess({ domains, url: requestUrl, tagName: 'fetch' });
    return response;
  } catch (error) {
    if (retryTimes <= 0) {
      onError && onError({ domains, url: requestUrl, tagName: 'fetch' });
      logger.log(
        `${PLUGIN_IDENTIFIER}: retry failed, no retries left for url: ${requestUrl}`,
      );
      throw new Error(
        `${PLUGIN_IDENTIFIER}: The request failed and has now been abandoned`,
      );
    } else {
      onRetry &&
        onRetry({
          times: total - retryTimes + 1,
          domains,
          url: requestUrl,
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
