import { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';
import { fetchWithRetry } from './fetch-retry';
import type { RetryPluginParams } from './types';
import { scriptRetry } from './script-retry';
import { PLUGIN_IDENTIFIER } from './constant';
import logger from './logger';

// global cache, record the uniqueKey that has been entered loadEntryError
const loadEntryErrorCache = new Set<string>();

const RetryPlugin: (
  params: RetryPluginParams,
) => ModuleFederationRuntimePlugin = ({
  fetch: fetchOption,
  script: scriptOption,
}) => ({
  name: 'retry-plugin',
  async fetch(manifestUrl: string, options: RequestInit) {
    const { retryTimes, fallback, getRetryPath } = fetchOption || {};
    if (fetchOption) {
      return fetchWithRetry({
        manifestUrl,
        options: {
          ...options,
          ...fetchOption?.options,
        },
        retryTimes,
        fallback,
        getRetryPath,
      });
    }
    return fetch(manifestUrl, options);
  },

  async loadEntryError({
    getRemoteEntry,
    origin,
    remoteInfo,
    remoteEntryExports,
    globalLoading,
    uniqueKey,
  }) {
    if (!scriptOption || loadEntryErrorCache.has(uniqueKey)) {
      logger.log(
        `${PLUGIN_IDENTIFIER}: loadEntryError already processed for uniqueKey: ${uniqueKey}, skipping retry`,
      );
      return;
    }

    loadEntryErrorCache.add(uniqueKey);
    const beforeExecuteRetry = () => {
      delete globalLoading[uniqueKey];
    };

    const getRemoteEntryRetry = scriptRetry({
      scriptOption,
      moduleInfo: remoteInfo,
      retryFn: getRemoteEntry,
      beforeExecuteRetry,
    });

    try {
      const result = await getRemoteEntryRetry({
        origin,
        remoteInfo,
        remoteEntryExports,
      });
      // after success, remove from cache, allow subsequent possible reload
      loadEntryErrorCache.delete(uniqueKey);
      return result;
    } catch (error) {
      // after failure, also remove from cache, avoid permanent blocking
      loadEntryErrorCache.delete(uniqueKey);
      throw error;
    }
  },
});

export { RetryPlugin };
export type {
  RetryPluginParams,
  FetchWithRetryOptions,
  ScriptWithRetryOptions,
} from './types';
