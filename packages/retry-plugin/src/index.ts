import { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';
import { fetchWithRetry } from './fetch-retry';
import type { RetryPluginParams } from './types';
import { scriptCommonRetry } from './util';

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
      fetchWithRetry({
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
