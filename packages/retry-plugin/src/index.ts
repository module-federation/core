import { FederationRuntimePlugin } from '@module-federation/runtime/types';
import { fetchWithRetry } from './fetch-retry';
import { defaultRetries, defaultRetryDelay } from './constant';
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
  async getModuleFactory({ remoteEntryExports, expose, moduleInfo }) {
    let moduleFactory;
    const { retryTimes = defaultRetries, retryDelay = defaultRetryDelay } =
      scriptOption || {};

    if (
      (scriptOption?.moduleName &&
        scriptOption?.moduleName.some(
          (m) => moduleInfo.name === m || (moduleInfo as any)?.alias === m,
        )) ||
      scriptOption?.moduleName === undefined
    ) {
      let attempts = 0;

      while (attempts - 1 < retryTimes) {
        try {
          moduleFactory = await remoteEntryExports.get(expose);
          break;
        } catch (error) {
          attempts++;
          if (attempts - 1 >= retryTimes) {
            scriptOption?.cb &&
              (await new Promise(
                (resolve) =>
                  scriptOption?.cb && scriptOption?.cb(resolve, error),
              ));
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }
    return moduleFactory;
  },
});

export { RetryPlugin };
export type {
  RetryPluginParams,
  FetchWithRetryOptions,
  ScriptWithRetryOptions,
} from './types';
