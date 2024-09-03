import { FederationRuntimePlugin } from '../../type/plugin';
import type { CreateScriptHookReturn } from '@module-federation/sdk';
import { fetchWithRetry } from './fetch-retry';
import { scriptWithRetry } from './script-retry';
import type { RetryPluginParams } from './types';

const RetryPlugin: (params: RetryPluginParams) => FederationRuntimePlugin = ({
  fetch: fetchOption,
  script: scriptOption,
}) => ({
  name: 'retry-plugin',
  async fetch(url: string, options: RequestInit) {
    // if fetch retry rule is configured
    if (fetchOption) {
      if (fetchOption.url) {
        if (url === fetchOption?.url) {
          return fetchWithRetry({
            url,
            options,
            retryTimes: fetchOption?.retryTimes,
            fallback: fetchOption?.fallback,
          });
        }
      } else {
        return fetchWithRetry({
          url,
          options: {
            ...options,
            ...fetchOption?.options,
          },
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

export default RetryPlugin;
export type {
  RetryPluginParams,
  FetchWithRetryOptions,
  ScriptWithRetryOptions,
} from './types';
