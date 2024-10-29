import { FederationRuntimePlugin } from '@module-federation/runtime/types';
import { fetchWithRetry } from './fetch-retry';
import type { RetryPluginParams } from './types';
export const DEFAULT_MAX_RETRY_TIMES = 3;
export const DEFAULT_RETRY_DELAY = 1000;

const RetryPlugin: (params: RetryPluginParams) => FederationRuntimePlugin = ({
  fetch: fetchOption,
  script: scriptOption,
}) => ({
  name: 'retry-plugin',
  async getModuleFactory({ remoteEntryExports, expose, id }) {
    let moduleFactory;
    const {
      retryTimes = DEFAULT_MAX_RETRY_TIMES,
      retryDelay = DEFAULT_RETRY_DELAY,
    } = scriptOption || {};

    if (
      (scriptOption?.moduleName && scriptOption?.moduleName === id) ||
      scriptOption?.moduleName === undefined
    ) {
      let attempts = 0;
      while (attempts < retryTimes) {
        try {
          moduleFactory = await remoteEntryExports.get(expose);
          break;
        } catch (error) {
          attempts++;
          if (attempts >= retryTimes) {
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
});

export { RetryPlugin };
export type {
  RetryPluginParams,
  FetchWithRetryOptions,
  ScriptWithRetryOptions,
} from './types';
