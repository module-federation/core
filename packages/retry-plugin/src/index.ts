import { FederationRuntimePlugin } from '@module-federation/runtime/types';
import { fetchWithRetry } from './fetch-retry';
import type { RetryPluginParams } from './types';
import { scriptCommonRetry } from './util';

const RetryPlugin: (params: RetryPluginParams) => FederationRuntimePlugin = ({
  fetch: fetchOption,
  script: scriptOption,
}) => ({
  name: 'retry-plugin',
  async fetch(url: string, options: RequestInit) {
    const _options = {
      ...options,
      ...fetchOption?.options,
    };

    if (fetchOption) {
      if (fetchOption.url) {
        if (url === fetchOption?.url) {
          return fetchWithRetry({
            url: fetchOption.url,
            options: _options,
            retryTimes: fetchOption?.retryTimes,
            fallback: fetchOption?.fallback,
          });
        }
      } else {
        // or when fetch retry rule is configured, retry for all urls
        return fetchWithRetry({
          url,
          options: _options,
          retryTimes: fetchOption?.retryTimes,
          fallback: fetchOption?.fallback,
        });
      }
    }
    return fetch(url, options);
  },

  async loadEntryError({
    getRemoteEntry,
    origin,
    remoteInfo,
    remoteEntryExports,
    globalLoading,
    uniqueKey,
  }) {
    if (!scriptOption) return;
    const retryFn = getRemoteEntry;
    const beforeExecuteRetry = () => delete globalLoading[uniqueKey];
    const getRemoteEntryRetry = scriptCommonRetry({
      scriptOption,
      moduleInfo: remoteInfo,
      retryFn,
      beforeExecuteRetry,
    });
    return getRemoteEntryRetry({
      origin,
      remoteInfo,
      remoteEntryExports,
    });
  },
  async getModuleFactory({ remoteEntryExports, expose, moduleInfo }) {
    if (!scriptOption) return;
    const retryFn = remoteEntryExports.get;
    const getRemoteEntryRetry = scriptCommonRetry({
      scriptOption,
      moduleInfo,
      retryFn,
    });
    return getRemoteEntryRetry(expose);
  },
});

export { RetryPlugin };
export type {
  RetryPluginParams,
  FetchWithRetryOptions,
  ScriptWithRetryOptions,
} from './types';
