import { FederationRuntimePlugin } from '../../type/plugin';
import type { CreateScriptHookReturn } from '@module-federation/sdk';
import { fetchWithRetry } from './fetch-retry';
import type { FetchWithRetryOptions } from './fetch-retry';
import { scriptWithRetry } from './script-retry';

const RetryPlugin: (
  params?: Omit<FetchWithRetryOptions, 'url'>,
) => FederationRuntimePlugin = (params) => ({
  name: 'retry-plugin',
  async fetch(url: string, options: RequestInit) {
    return fetchWithRetry({
      url,
      options: {
        ...options,
        ...params?.options,
      },
      retryTimes: params?.retryTimes,
      fallback: params?.fallback,
    });
  },
  createScript({ url, attrs }) {
    console.log('>>>>>>>>>> createScript <<<<<<<<<<<', url, attrs);
    // 对指定资源进行 retry
    if (url.endsWith('src_App_tsx.js')) {
      return scriptWithRetry({
        url: `${url}-fake`,
        attrs,
        retryTimes: params?.retryTimes,
        customCreateScript: (url, attrs) => {
          let script = document.createElement('script');
          script.src = url;
          script.setAttribute('loader-hooks', 'isTrue');
          script.setAttribute('crossorigin', 'anonymous');
          return script;
        },
      });
    }
    return null as unknown as HTMLScriptElement; // Ensure null is assignable

    // 对所有资源进行 retry
    // return scriptWithRetry({
    //   url: `${url}-fake`,
    //   attrs,
    //   retryTimes: params?.retryTimes,
    //   customCreateScript: (url, attrs) => {
    //     if (url.endsWith('src_App_tsx.js')) {
    //       let script = document.createElement('script');
    //       script.src = url;
    //       script.setAttribute('loader-hooks', 'isTrue');
    //       script.setAttribute('crossorigin', 'anonymous');
    //       return script;
    //     }
    //     return null as unknown as HTMLScriptElement; // Ensure null is assignable
    //     // return null as unknown as CreateScriptHookReturn; // Ensure null is assignable
    //   }
    // });
  },
});

export default RetryPlugin;
