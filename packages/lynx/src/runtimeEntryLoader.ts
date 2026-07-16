import type {
  RemoteEntryExports,
  RemoteEntryInitOptions,
} from '@module-federation/runtime-core/types';

import {
  findRemoteEntryExports,
  getBundleRegistry,
  getRemoteOriginKey,
  getRegistryKey,
  isRecord,
  MAIN_THREAD_EXPOSE_SUFFIX,
  toErrorMessage,
  type LynxGlobal,
  type LynxRealm,
  type LynxRuntime,
} from './runtimeCore';
import { loadWithTimeout } from './runtimeTimeout';

const DEFAULT_TIMEOUT = 30_000;

interface LynxBundleResponse {
  code: number;
  url: string;
  errorMsg?: string;
}

export const isBundleEntry = (entry: string): boolean =>
  entry.split(/[?#]/, 1)[0].endsWith('.lynx.bundle');

export const getTimeout = (timeout: number | undefined): number =>
  timeout !== undefined && Number.isFinite(timeout) && timeout >= 0
    ? timeout
    : DEFAULT_TIMEOUT;

const getBundleResponse = (value: unknown): LynxBundleResponse | undefined => {
  if (
    !isRecord(value) ||
    typeof value.code !== 'number' ||
    typeof value.url !== 'string'
  ) {
    return undefined;
  }

  return {
    code: value.code,
    url: value.url,
    errorMsg:
      typeof value.errorMsg === 'string'
        ? value.errorMsg
        : typeof value.error_msg === 'string'
          ? value.error_msg
          : undefined,
  };
};

export const loadJavaScriptEntry = (
  lynx: LynxRuntime,
  entry: string,
  entryGlobalName: string,
  globalObject: LynxGlobal,
  timeout: number,
): Promise<RemoteEntryExports> => {
  const requireModuleAsync = lynx.requireModuleAsync;
  if (!requireModuleAsync) {
    throw new Error(
      'Lynx federation requires globalThis.lynx.requireModuleAsync to load JavaScript remote entries in the background runtime.',
    );
  }

  return loadWithTimeout<RemoteEntryExports>(
    timeout,
    `Timed out loading Lynx remote entry "${entryGlobalName}" from "${entry}" after ${timeout}ms.`,
    (resolve, reject, isSettled) => {
      requireModuleAsync(entry, (error, value) => {
        if (isSettled()) {
          return;
        }
        if (error) {
          reject(
            new Error(
              `Failed to load Lynx remote entry "${entryGlobalName}" from "${entry}": ${toErrorMessage(error)}`,
            ),
          );
          return;
        }

        const exports = findRemoteEntryExports(
          value,
          entryGlobalName,
          globalObject,
        );
        if (!exports) {
          reject(
            new Error(
              `Lynx remote entry "${entryGlobalName}" loaded from "${entry}" but did not export a Module Federation container.`,
            ),
          );
          return;
        }

        resolve(exports);
      });
    },
  );
};

const adaptContainerToRealm = (
  container: RemoteEntryExports,
  realm: LynxRealm,
): RemoteEntryExports => ({
  get: (request) =>
    container.get(
      realm === 'background'
        ? request
        : `${request}${MAIN_THREAD_EXPOSE_SUFFIX}`,
    ),
  init: (shareScope, initScope, options) => {
    if (!isRecord(options) || !Array.isArray(options.shareScopeKeys)) {
      return container.init(shareScope, initScope, options);
    }

    const shareScopeKeys = options.shareScopeKeys.filter(
      (value): value is string => typeof value === 'string',
    );
    const realmSuffix = realm === 'background' ? ':background' : ':main-thread';
    const realmShareScopeKeys = shareScopeKeys.filter((key) =>
      key.endsWith(realmSuffix),
    );
    const primaryShareScopeKey = realmShareScopeKeys[0];
    if (!primaryShareScopeKey) {
      return container.init(shareScope, initScope, options);
    }

    const narrowedOptions = Object.create(
      Object.getPrototypeOf(options),
      Object.getOwnPropertyDescriptors(options),
    ) as RemoteEntryInitOptions;
    Object.defineProperty(narrowedOptions, 'shareScopeKeys', {
      configurable: true,
      enumerable: true,
      value:
        realmShareScopeKeys.length === 1
          ? primaryShareScopeKey
          : realmShareScopeKeys,
      writable: true,
    });
    const shareScopeMap = options.shareScopeMap;
    const realmShareScope = isRecord(shareScopeMap)
      ? shareScopeMap[primaryShareScopeKey]
      : undefined;
    return container.init(
      isRecord(realmShareScope) ? realmShareScope : shareScope,
      initScope,
      narrowedOptions,
    );
  },
});

export const loadBundleEntry = (
  lynx: LynxRuntime,
  entry: string,
  entryGlobalName: string,
  realm: LynxRealm,
  globalObject: LynxGlobal,
  timeout: number,
): Promise<RemoteEntryExports> => {
  const { fetchBundle, loadScript } = lynx;
  if (!fetchBundle || !loadScript) {
    throw new Error(
      'Lynx federation requires globalThis.lynx.fetchBundle and globalThis.lynx.loadScript to load .lynx.bundle remote entries.',
    );
  }

  let rollbackRegistry: (() => void) | undefined;
  return loadWithTimeout<RemoteEntryExports>(
    timeout,
    `Timed out loading Lynx remote bundle "${entryGlobalName}" from "${entry}" after ${timeout}ms.`,
    (resolve, reject, isSettled) => {
      Promise.resolve(fetchBundle(entry)).then(
        (value) => {
          if (isSettled()) {
            return;
          }

          const response = getBundleResponse(value);
          if (!response || response.code !== 0 || !response.url) {
            const details = response
              ? `code ${response.code}${response.errorMsg ? `: ${response.errorMsg}` : ''}`
              : 'an invalid response';
            reject(
              new Error(
                `Failed to fetch Lynx remote bundle "${entryGlobalName}" from "${entry}": ${details}.`,
              ),
            );
            return;
          }

          const registry = getBundleRegistry(globalObject);
          const updates = [
            [entryGlobalName, response.url],
            [getRemoteOriginKey(entryGlobalName), entry],
            [getRegistryKey(entryGlobalName, 'main-thread'), response.url],
          ] as const;
          const previous = updates.map(([key, nextValue]) => ({
            hadValue: registry.has(key),
            key,
            nextValue,
            previousValue: registry.get(key),
          }));
          for (const [key, value] of updates) {
            registry.set(key, value);
          }
          rollbackRegistry = () => {
            for (const state of previous) {
              if (registry.get(state.key) !== state.nextValue) {
                continue;
              }
              if (state.hadValue) {
                registry.set(state.key, state.previousValue!);
              } else {
                registry.delete(state.key);
              }
            }
          };

          const sectionPath =
            realm === 'background'
              ? entryGlobalName
              : `${entryGlobalName}__main-thread`;

          try {
            const value = loadScript(sectionPath, { bundleName: response.url });
            Promise.resolve(value).then(
              (loadedValue) => {
                if (isSettled()) {
                  return;
                }
                const exports = findRemoteEntryExports(
                  loadedValue,
                  entryGlobalName,
                  globalObject,
                  getRegistryKey(entryGlobalName, realm),
                );
                if (!exports) {
                  reject(
                    new Error(
                      `Lynx remote bundle "${entryGlobalName}" loaded from "${entry}" but did not export a Module Federation container.`,
                    ),
                  );
                  return;
                }
                rollbackRegistry = undefined;
                resolve(adaptContainerToRealm(exports, realm));
              },
              (error) =>
                reject(
                  new Error(
                    `Failed to evaluate Lynx remote bundle "${entryGlobalName}" from "${entry}": ${toErrorMessage(error)}`,
                  ),
                ),
            );
          } catch (error) {
            reject(
              new Error(
                `Failed to evaluate Lynx remote bundle "${entryGlobalName}" from "${entry}": ${toErrorMessage(error)}`,
              ),
            );
          }
        },
        (error) => {
          if (!isSettled()) {
            reject(
              new Error(
                `Failed to fetch Lynx remote bundle "${entryGlobalName}" from "${entry}": ${toErrorMessage(error)}`,
              ),
            );
          }
        },
      );
    },
  ).catch((error) => {
    rollbackRegistry?.();
    throw error;
  });
};
