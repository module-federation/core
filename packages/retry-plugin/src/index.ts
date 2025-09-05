import { ModuleFederationRuntimePlugin } from '@module-federation/runtime/types';
import { fetchRetry } from './fetch-retry';
import type { CommonRetryOptions } from './types';
import { scriptRetry } from './script-retry';
import {
  PLUGIN_IDENTIFIER,
  defaultRetries,
  defaultRetryDelay,
} from './constant';
import logger from './logger';

const loadEntryErrorCache = new Set<string>();
const RetryPlugin = (
  params?: CommonRetryOptions,
): ModuleFederationRuntimePlugin => {
  const {
    fetchOptions = {},
    retryTimes = defaultRetries,
    successTimes = 0,
    retryDelay = defaultRetryDelay,
    domains = [],
    addQuery,
    onRetry,
    onSuccess,
    onError,
  } = params || {};

  return {
    name: 'retry-plugin',
    async fetch(manifestUrl: string, options: RequestInit) {
      return fetchRetry({
        url: manifestUrl,
        fetchOptions: {
          ...options,
          ...fetchOptions,
        },
        domains,
        addQuery,
        onRetry,
        onSuccess,
        onError,
        retryTimes,
        successTimes,
        retryDelay,
      });
    },

    async loadEntryError({
      getRemoteEntry,
      origin,
      remoteInfo,
      remoteEntryExports,
      globalLoading,
      uniqueKey,
    }) {
      if (loadEntryErrorCache.has(uniqueKey)) {
        logger.warn(
          `${PLUGIN_IDENTIFIER}: uniqueKey ${uniqueKey} has already been retried, skipping retry`,
        );
        throw new Error(`Entry ${uniqueKey} has already been retried`);
      }

      loadEntryErrorCache.add(uniqueKey);
      const beforeExecuteRetry = () => {
        delete globalLoading[uniqueKey];
      };

      const getRemoteEntryRetry = scriptRetry({
        retryOptions: {
          retryTimes,
          retryDelay,
          domains,
          addQuery,
          onRetry,
          onSuccess,
          onError,
        },
        retryFn: getRemoteEntry,
        beforeExecuteRetry,
      });

      try {
        const result = await getRemoteEntryRetry({
          origin,
          remoteInfo,
          remoteEntryExports,
        });
        return result;
      } catch (error) {
        loadEntryErrorCache.delete(uniqueKey);
        throw error;
      }
    },
  };
};

export { RetryPlugin };
export type {
  CommonRetryOptions,
  FetchRetryOptions,
  ScriptRetryOptions,
} from './types';
