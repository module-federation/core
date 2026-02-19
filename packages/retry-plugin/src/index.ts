import { ModuleFederationRuntimePlugin } from '@module-federation/runtime';
import type { CommonRetryOptions } from './types';
import { fetchRetry } from './fetch-retry';
import { scriptRetry } from './script-retry';
import {
  PLUGIN_IDENTIFIER,
  defaultRetries,
  defaultRetryDelay,
} from './constant';
import logger from './logger';

const RetryPlugin = (
  params?: CommonRetryOptions,
): ModuleFederationRuntimePlugin => {
  // @ts-ignore
  if (params?.fetch || params?.script) {
    logger.warn(
      `${PLUGIN_IDENTIFIER}: params is ${params}, fetch or script config is deprecated, please use the new config style. See docs: https://module-federation.io/plugin/plugins/retry-plugin.html`,
    );
  }
  const {
    fetchOptions = {},
    retryTimes = defaultRetries,
    successTimes = 0,
    retryDelay = defaultRetryDelay,
    domains = [],
    manifestDomains = [],
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
        domains: manifestDomains || domains,
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
    }: {
      getRemoteEntry: (...args: any[]) => Promise<any>;
      origin: any;
      remoteInfo: any;
      remoteEntryExports?: any;
      globalLoading: Record<string, unknown>;
      uniqueKey: string;
    }) {
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

      const result = await getRemoteEntryRetry({
        origin,
        remoteInfo,
        remoteEntryExports,
      });
      return result;
    },
  };
};

export { RetryPlugin };
export type {
  CommonRetryOptions,
  FetchRetryOptions,
  ScriptRetryOptions,
} from './types';
export {
  getRetryUrl,
  rewriteWithNextDomain,
  appendRetryCountQuery,
  combineUrlDomainWithPathQuery,
} from './utils';
