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
    // 如果配置了 fetch 重试规则
    if (fetchOption) {
      return fetchWithRetry({
        url: fetchOption?.url || url,
        options: {
          ...options,
          ...fetchOption?.options,
        },
        retryTimes: fetchOption?.retryTimes,
        fallback: fetchOption?.fallback,
      });
    }
    // 未配置 fecth 重试规则，则直接请求
    return fetch(url, options);
  },

  createScript({ url, attrs }) {
    const scriptAttrs = scriptOption?.attrs
      ? { ...attrs, ...scriptOption.attrs }
      : attrs;
    if (scriptOption) {
      return scriptWithRetry({
        url: scriptOption?.url || url,
        attrs: scriptAttrs,
        retryTimes: scriptOption?.retryTimes,
        customCreateScript: scriptOption?.customCreateScript
          ? scriptOption.customCreateScript
          : undefined,
      });
    }

    return {};
  },
});

export default RetryPlugin;
export type { RetryPluginParams } from './types';
