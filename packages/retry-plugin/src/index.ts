import { FederationRuntimePlugin } from '@module-federation/runtime/types';
import { fetchWithRetry } from './fetch-retry';
import { scriptWithRetry } from './script-retry';
import type { RetryPluginParams } from './types';

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
    // if fetch retry rule is configured
    if (fetchOption) {
      // when fetch retry rule is configured, only retry for specified url
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
    // return default fetch
    return fetch(url, options);
  },

  createScript({ url, attrs }) {
    const scriptAttrs = scriptOption?.attrs
      ? { ...attrs, ...scriptOption.attrs }
      : attrs;
    if (scriptOption) {
      // when script retry rule is configured, only retry for specified url
      if (scriptOption?.url) {
        if (url === scriptOption?.url) {
          return scriptWithRetry({
            url: scriptOption?.url as string,
            attrs: scriptAttrs,
            retryTimes: scriptOption?.retryTimes,
            customCreateScript: scriptOption?.customCreateScript
              ? scriptOption.customCreateScript
              : undefined,
          });
        }
      } else {
        // or when script retry rule is configured, retry for all urls
        return scriptWithRetry({
          url,
          attrs: scriptAttrs,
          retryTimes: scriptOption?.retryTimes,
          customCreateScript: scriptOption?.customCreateScript
            ? scriptOption.customCreateScript
            : undefined,
        });
      }
    }
    return {};
  },
});

export { RetryPlugin };
export type {
  RetryPluginParams,
  FetchWithRetryOptions,
  ScriptWithRetryOptions,
} from './types';
