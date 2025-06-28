import { getAllKnownRemotes } from './flush-chunks';
import { createHMRClient } from './hmr-client';
import type { HMRClient } from '../types/hmr';
import crypto from 'crypto';
import helpers from '@module-federation/runtime/helpers';

declare global {
  var mfHashMap: Record<string, string> | undefined;
  var moduleGraphDirty: boolean;
  var mfHMRClient: HMRClient | undefined;
}

const hashmap = globalThis.mfHashMap || ({} as Record<string, string>);
globalThis.moduleGraphDirty = false;

/**
 * Initialize or get the global HMR client instance for Module Federation hot reload
 */
function getOrCreateHMRClient(): HMRClient {
  if (!globalThis.mfHMRClient) {
    globalThis.mfHMRClient = createHMRClient({
      autoAttach: true,
      logging: true,
      pollingInterval: 1000,
      maxRetries: 3,
    });
    console.log('[Module Federation Hot Reload] HMR Client initialized');
  }
  return globalThis.mfHMRClient;
}

/**
 * Trigger HMR update when remote entry changes are detected
 * This is the primary integration point between Federation's change detection and HMR
 */
export const triggerHMRUpdate = async (): Promise<boolean> => {
  try {
    console.log(
      '[Module Federation Hot Reload] Triggering HMR update for remote entry changes...',
    );

    const hmrClient = getOrCreateHMRClient();
    const result = await hmrClient.forceUpdate({
      createMinimalUpdate: true,
    });

    if (result.success) {
      console.log(
        '[Module Federation Hot Reload] HMR update triggered successfully',
      );
      return true;
    } else {
      console.warn(
        '[Module Federation Hot Reload] Failed to trigger HMR update:',
        result.message,
      );
      return false;
    }
  } catch (error) {
    console.error(
      '[Module Federation Hot Reload] Error triggering HMR update:',
      error,
    );
    return false;
  }
};

export const performReload = async (
  shouldReload: boolean,
): Promise<boolean> => {
  if (!shouldReload) {
    return false;
  }

  try {
    console.log('[Module Federation Hot Reload] Starting HMR-based reload...');

    const gs = new Function('return globalThis')();
    console.log(
      '[Module Federation Hot Reload] Starting server-side nuclear reset...',
    );

    // 1. Clear ALL webpack chunks and modules
    //@ts-ignore
    if (typeof __webpack_require__ !== 'undefined') {
      console.log(
        '[Module Federation Hot Reload] Clearing webpack require cache...',
      );
      //@ts-ignore
      if (__webpack_require__.cache) {
        //@ts-ignore
        Object.keys(__webpack_require__.cache).forEach((id) => {
          //@ts-ignore
          delete __webpack_require__.cache[id];
        });
      }

      // Clear chunk loading cache
      //@ts-ignore
      if (__webpack_require__.l && __webpack_require__.l.cache) {
        //@ts-ignore
        __webpack_require__.l.cache.clear();
      }

      // Clear chunk registry
      //@ts-ignore
      if (__webpack_require__.cache) {
        //@ts-ignore
        __webpack_require__.cache = {};
      }
    }

    // 2. Clear ALL federation instances and their caches (but preserve bundlerRuntime)
    //@ts-ignore
    if (gs.__FEDERATION__ && gs.__FEDERATION__.__INSTANCES__) {
      //@ts-ignore
      gs.__FEDERATION__.__INSTANCES__.forEach((instance: any) => {
        // Preserve bundlerRuntime before clearing
        const preservedBundlerRuntime = instance.bundlerRuntime;

        // Clear module cache
        if (instance.moduleCache) {
          instance.moduleCache.forEach((mc: any) => {
            if (mc.remoteInfo && mc.remoteInfo.entryGlobalName) {
              delete gs[mc.remoteInfo.entryGlobalName];
            }
          });
          instance.moduleCache.clear();
        }

        // Clear remote cache
        if (instance.remoteCache) {
          instance.remoteCache.clear();
        }

        // Clear share scope map but preserve structure
        if (instance.shareScopeMap) {
          Object.keys(instance.shareScopeMap).forEach((scope) => {
            if (instance.shareScopeMap[scope]) {
              // Clear the contents but keep the scope structure
              Object.keys(instance.shareScopeMap[scope]).forEach((pkg) => {
                delete instance.shareScopeMap[scope][pkg];
              });
            }
          });
        }

        // Restore bundlerRuntime after clearing
        if (preservedBundlerRuntime) {
          instance.bundlerRuntime = preservedBundlerRuntime;
          console.log(
            '[Module Federation Hot Reload] Preserved bundlerRuntime for instance:',
            instance.name,
          );
        }

        // Don't delete instance global, just clear its caches
        // if (gs[instance.name]) {
        //   delete gs[instance.name];
        // }
      });

      // Don't clear the instances array completely, just their caches
      // gs.__FEDERATION__.__INSTANCES__ = [];
    }

    // 3. Clear federation-related webpack instances (preserve bundlerRuntime)
    //@ts-ignore
    if (__webpack_require__?.federation) {
      //@ts-ignore
      if ((__webpack_require__ as any).federation?.instance) {
        // Preserve bundlerRuntime
        //@ts-ignore
        const preservedBundlerRuntime = (__webpack_require__ as any).federation
          .instance.bundlerRuntime;

        //@ts-ignore
        (__webpack_require__ as any).federation.instance.moduleCache?.clear();
        //@ts-ignore
        (__webpack_require__ as any).federation.instance.remoteCache?.clear();

        // Restore bundlerRuntime
        if (preservedBundlerRuntime) {
          //@ts-ignore
          (__webpack_require__ as any).federation.instance.bundlerRuntime =
            preservedBundlerRuntime;
          console.log(
            '[Module Federation Hot Reload] Preserved webpack federation bundlerRuntime',
          );
        }

        // Don't delete the instance completely
        // delete __webpack_require__.federation.instance;
      }
      // Don't delete federation completely
      // delete __webpack_require__.federation;
    }

    // 4. Clear ALL Next.js related caches
    if (gs.__NEXT_DATA__) {
      delete gs.__NEXT_DATA__;
    }

    // Clear Next.js module cache for federation modules
    if (gs.__webpack_require__ && gs.__webpack_require__.cache) {
      Object.keys(gs.__webpack_require__.cache).forEach((moduleId) => {
        // Clear federation module entries
        if (
          moduleId.includes('shop/') ||
          moduleId.includes('checkout/') ||
          moduleId.includes('webpack_container_remote') ||
          moduleId.includes('federation')
        ) {
          console.log(
            `[Module Federation Hot Reload] Clearing Next.js cache for: ${moduleId}`,
          );
          delete gs.__webpack_require__.cache[moduleId];
        }
      });
    }

    // Clear Next.js build manifests that might cache federation modules
    if (gs.__BUILD_MANIFEST) {
      delete gs.__BUILD_MANIFEST;
    }
    if (gs.__BUILD_MANIFEST_CB) {
      delete gs.__BUILD_MANIFEST_CB;
    }

    // 5. Clear ALL federation globals and registries
    helpers.global.resetFederationGlobalInfo();

    // Reset ALL federation-related globals
    globalThis.moduleGraphDirty = false;
    globalThis.mfHashMap = {};

    if (gs.usedChunks) {
      gs.usedChunks.clear();
    }

    // Clear manifest and runtime caches
    if (gs.__FEDERATION_MANIFEST_CACHE__) {
      gs.__FEDERATION_MANIFEST_CACHE__ = {};
    }

    if (gs.__FEDERATION_RUNTIME__) {
      delete gs.__FEDERATION_RUNTIME__;
    }

    // Clear any shared scope maps
    if (gs.__FEDERATION_SHARED__) {
      delete gs.__FEDERATION_SHARED__;
    }

    // 6. Clear selective remote entry globals (avoid critical runtime components)
    Object.keys(gs).forEach((key) => {
      // Only clear globals that are clearly cache-related, not runtime components
      if (
        (key.includes('remote') && !key.includes('Runtime')) ||
        (key.includes('Remote') && !key.includes('Runtime')) ||
        key.includes('mf_') ||
        (key.includes('container') && key.includes('cache')) ||
        (key.includes('Container') && key.includes('cache')) ||
        key.includes('_cache') ||
        key.includes('Cache')
      ) {
        try {
          // Double check this isn't a critical runtime component
          if (
            !key.includes('bundlerRuntime') &&
            !key.includes('Runtime') &&
            !key.includes('__FEDERATION__') &&
            !key.includes('__webpack_require__')
          ) {
            delete gs[key];
            console.log(
              `[Module Federation Hot Reload] Cleared global: ${key}`,
            );
          }
        } catch (e) {
          // Some globals might be non-configurable
        }
      }
    });

    // 7. Force garbage collection if available
    //@ts-ignore
    if (global.gc) {
      //@ts-ignore
      global.gc();
      console.log('[Module Federation Hot Reload] Forced garbage collection');
    }

    console.log(
      '[Module Federation Hot Reload] NUCLEAR RESET COMPLETE - all modules and chunks cleared',
    );

    // Use HMR client for hot module replacement
    const hmrClient = getOrCreateHMRClient();

    const result = await hmrClient.forceUpdate({
      createMinimalUpdate: true,
    });

    if (result.success) {
      console.log(
        '[Module Federation Hot Reload] HMR update applied successfully',
      );
      return true;
    } else {
      console.warn(
        '[Module Federation Hot Reload] HMR update failed:',
        result.message,
      );

      // Fallback: Nuclear reset already happened, now force complete reinitialization
      console.log(
        '[Module Federation Hot Reload] Primary HMR failed, forcing complete reinitialization...',
      );

      try {
        // Method 1: Force complete webpack chunk invalidation
        //@ts-ignore
        if (typeof __webpack_require__ !== 'undefined') {
          console.log(
            '[Module Federation Hot Reload] Forcing webpack chunk invalidation...',
          );

          // Clear ALL webpack caches aggressively
          //@ts-ignore
          if (__webpack_require__.cache) {
            //@ts-ignore
            Object.keys(__webpack_require__.cache).forEach((id) => {
              try {
                //@ts-ignore
                delete __webpack_require__.cache[id];
              } catch (e) {}
            });
            //@ts-ignore
            __webpack_require__.cache = {};
          }

          // Force clear chunk loading functions
          //@ts-ignore
          if (__webpack_require__.l) {
            //@ts-ignore
            __webpack_require__.l.cache = new Map();
          }

          // Reset webpack chunk registry
          //@ts-ignore
          if (__webpack_require__.O) {
            //@ts-ignore
            __webpack_require__.O.j = {};
          }
        }

        // Method 2: Force federation runtime reinitialization
        console.log(
          '[Module Federation Hot Reload] Forcing federation runtime reinitialization...',
        );
        const gs = new Function('return globalThis')();

        // Force recreate federation instances from scratch
        //@ts-ignore
        if (gs.__FEDERATION__) {
          //@ts-ignore
          gs.__FEDERATION__ = {
            __INSTANCES__: [],
            __SHARE_SCOPE__: {},
            __GLOBAL_LOADING_DATA__: {},
          };
        }

        // Method 3: Force Next.js to reinitialize
        //@ts-ignore
        if (globalThis.webpackHotUpdate) {
          console.log(
            '[Module Federation Hot Reload] Triggering Next.js complete refresh...',
          );
          try {
            //@ts-ignore
            globalThis.webpackHotUpdate();
          } catch (e) {
            console.log(
              '[Module Federation Hot Reload] Next.js refresh failed, continuing...',
            );
          }
        }

        // Method 4: Force browser to treat everything as fresh
        console.log(
          '[Module Federation Hot Reload] Marking all modules as dirty for browser reload...',
        );

        // Set flags that will force fresh loading on next request
        globalThis.moduleGraphDirty = true;
        //@ts-ignore
        globalThis.federationNuclearReset = Date.now();

        console.log(
          '[Module Federation Hot Reload] Complete reinitialization successful!',
        );
        return true;
      } catch (fallbackError) {
        console.warn(
          '[Module Federation Hot Reload] Complete reinitialization failed:',
          fallbackError,
        );

        // Final fallback: At least we've cleared everything, mark for fresh start
        globalThis.moduleGraphDirty = true;
        //@ts-ignore
        globalThis.federationNuclearReset = Date.now();
        console.log(
          '[Module Federation Hot Reload] Nuclear reset completed, next request will be fresh',
        );
        return true;
      }
    }
  } catch (error) {
    console.error(
      '[Module Federation Hot Reload] Error during HMR-based reload:',
      error,
    );
    return false;
  }
};

export const checkUnreachableRemote = (remoteScope: any): boolean => {
  for (const property in remoteScope.remotes) {
    if (!remoteScope[property]) {
      console.error(
        'unreachable remote found',
        property,
        'hot reloading to refetch',
      );
      return true;
    }
  }
  return false;
};

export const checkMedusaConfigChange = (
  remoteScope: any,
  fetchModule: any,
): boolean => {
  //@ts-ignore
  if (remoteScope._medusa) {
    //@ts-ignore
    for (const property in remoteScope._medusa) {
      fetchModule(property)
        .then((res: Response) => res.json())
        .then((medusaResponse: any): void | boolean => {
          if (
            medusaResponse.version !==
            //@ts-ignore
            remoteScope?._medusa[property].version
          ) {
            console.log(
              'medusa config changed',
              property,
              'hot reloading to refetch',
            );
            performReload(true);
            return true;
          }
        });
    }
  }
  return false;
};

export const checkFakeRemote = (remoteScope: any): boolean => {
  for (const property in remoteScope._config) {
    let remote = remoteScope._config[property];

    const resolveRemote = async () => {
      remote = await remote();
    };

    if (typeof remote === 'function') {
      resolveRemote();
    }

    if (remote.fake) {
      console.log('fake remote found', property, 'hot reloading to refetch');
      return true;
    }
  }
  return false;
};

export const createFetcher = (
  url: string,
  fetchModule: any,
  name: string,
  cb: (hash: string) => void,
): Promise<void | boolean> => {
  console.log(
    `[Module Federation Debug] Creating fetcher for remote '${name}' at URL: ${url}`,
  );
  return fetchModule(url)
    .then((re: Response) => {
      console.log(
        `[Module Federation Debug] Fetch response for '${name}' - status: ${re.status}, ok: ${re.ok}`,
      );
      if (!re.ok) {
        throw new Error(
          `Error loading remote: status: ${
            re.status
          }, content-type: ${re.headers.get('content-type')}`,
        );
      }
      return re.text();
    })
    .then((contents: string): void | boolean => {
      const hash = crypto.createHash('md5').update(contents).digest('hex');
      console.log(
        `[Module Federation Debug] Generated hash for '${name}': ${hash} (content length: ${contents.length})`,
      );
      cb(hash);
    })
    .catch((e: Error) => {
      console.error('Remote', name, url, 'Failed to load or is not online', e);
    });
};

/**
 * Custom update check function that compares hash values
 * Uses HMR client to force apply updates when differences are detected
 */
const checkForUpdates = async (
  remoteName: string,
  newHash: string,
): Promise<boolean> => {
  const currentHash = hashmap[remoteName];
  console.log(
    `[Module Federation Debug] checkForUpdates called for '${remoteName}' - currentHash: ${currentHash}, newHash: ${newHash}`,
  );

  if (currentHash && currentHash !== newHash) {
    console.log(
      `[Module Federation HMR] Hash difference detected for ${remoteName}`,
    );
    console.log(
      `[Module Federation HMR] Old hash: ${currentHash}, New hash: ${newHash}`,
    );

    // Update the hash map
    hashmap[remoteName] = newHash;
    console.log(
      `[Module Federation Debug] Updated hashmap for '${remoteName}' with new hash`,
    );

    // Use HMR client to force apply update
    const hmrClient = getOrCreateHMRClient();
    console.log(
      `[Module Federation Debug] Triggering HMR update for '${remoteName}'...`,
    );
    const result = await hmrClient.forceUpdate({
      createMinimalUpdate: true,
    });

    if (result.success) {
      console.log(
        `[Module Federation HMR] Successfully applied HMR update for ${remoteName}`,
      );
      return true;
    } else {
      console.warn(
        `[Module Federation HMR] Failed to apply HMR update for ${remoteName}:`,
        result.message,
      );
      return false;
    }
  } else if (!currentHash) {
    // First time seeing this remote, just store the hash
    console.log(
      `[Module Federation Debug] First time seeing remote '${remoteName}', storing hash: ${newHash}`,
    );
    hashmap[remoteName] = newHash;
  } else {
    console.log(
      `[Module Federation Debug] No hash change detected for '${remoteName}' (current: ${currentHash}, new: ${newHash})`,
    );
  }

  return false;
};

export const fetchRemote = (
  remoteScope: any,
  fetchModule: any,
): Promise<boolean> => {
  const fetches: Promise<void | boolean>[] = [];
  let needReload = false;

  for (const property in remoteScope) {
    const name = property;
    const container = remoteScope[property];
    const url = container.entry;

    const fetcher = createFetcher(url, fetchModule, name, async (hash) => {
      const updateApplied = await checkForUpdates(name, hash);
      if (updateApplied) {
        needReload = true;
      }
    });

    fetches.push(fetcher);
  }

  return Promise.all(fetches).then(() => {
    return needReload;
  });
};
//@ts-ignore
/**
 * Revalidate remote entries and trigger HMR updates when changes are detected
 * This function detects remote entry changes and uses the HMR client for hot updates
 */
/**
 * Check for remote entry updates and apply HMR if changes are detected
 * This is the main entry point used by Next.js _document and other integration points
 */
export const revalidate = async (
  fetchModule: any = getFetchModule() || (() => undefined),
  force = false,
): Promise<boolean> => {
  let hasRemoteChanges = false;

  // Check for remote changes on both server and client side
  if (typeof window === 'undefined') {
    // Server-side: Check for remote changes and log detailed info
    console.log(
      '[Module Federation] Server-side revalidate called - checking for remote changes',
    );
    console.log(
      '[Module Federation Debug] fetchModule available:',
      !!fetchModule,
    );
    console.log('[Module Federation Debug] force parameter:', force);

    try {
      const remotesFromAPI = getAllKnownRemotes() as Record<
        string,
        { entry: string }
      >;
      console.log(
        '[Module Federation Debug] Known remotes:',
        Object.keys(remotesFromAPI),
      );

      for (const remoteName in remotesFromAPI) {
        const container = remotesFromAPI[remoteName];
        const url = container.entry;
        console.log(
          `[Module Federation Debug] Checking remote '${remoteName}' at ${url}`,
        );

        if (!url) continue;

        try {
          const response = await fetchModule(url);
          const content = await response.text();
          const newHash = crypto
            .createHash('md5')
            .update(content)
            .digest('hex');
          const currentHash = hashmap[remoteName];

          console.log(
            `[Module Federation Debug] Remote '${remoteName}' hash - current: ${currentHash}, new: ${newHash}`,
          );

          if (currentHash && currentHash !== newHash) {
            console.log(
              `[Module Federation] 🔥 SERVER-SIDE REMOTE CHANGE DETECTED for '${remoteName}'!`,
            );
            console.log(`[Module Federation] Old hash: ${currentHash}`);
            console.log(`[Module Federation] New hash: ${newHash}`);

            // Update hash even on server-side
            hashmap[remoteName] = newHash;

            // Set flags for immediate HMR processing
            globalThis.moduleGraphDirty = true;
            hasRemoteChanges = true;
            force = true; // Force HMR processing
            console.log(
              `[Module Federation] 🔥 Marking module graph as DIRTY - will attempt immediate HMR!`,
            );
          } else if (!currentHash) {
            console.log(
              `[Module Federation Debug] First time seeing remote '${remoteName}', storing hash`,
            );
            hashmap[remoteName] = newHash;
          }
        } catch (error) {
          console.warn(
            `[Module Federation Debug] Error checking remote '${remoteName}':`,
            error,
          );
        }
      }
    } catch (error) {
      console.error(
        '[Module Federation Debug] Error in server-side revalidate:',
        error,
      );
    }

    // If no changes detected on server-side, return early
    if (!hasRemoteChanges && !force) {
      return false;
    }
  }

  if (globalThis.moduleGraphDirty || force) {
    console.log(
      `[Module Federation] 🚀 TRIGGERING FORCE RELOAD - moduleGraphDirty: ${globalThis.moduleGraphDirty}, force: ${force}`,
    );
    return await federationHMRIntegration.forceReload();
  }

  // Use the new HMR integration to check and apply updates
  return await federationHMRIntegration.checkAndApplyUpdates();
};

export function getFetchModule(): any {
  //@ts-ignore
  const loadedModule =
    //@ts-ignore
    globalThis.webpackChunkLoad || global.webpackChunkLoad || global.fetch;
  if (loadedModule) {
    return loadedModule;
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeFetch = require('node-fetch');
  return nodeFetch.default || nodeFetch;
}

/**
 * Enhanced integration function for Module Federation + HMR
 * This provides a clean interface for external code to trigger HMR-based reloads
 * when federation remote entries change
 */
export const federationHMRIntegration = {
  /**
   * Initialize HMR client for federation hot reload
   */
  init(): HMRClient {
    return getOrCreateHMRClient();
  },

  /**
   * Check for updates on all known remotes
   * This is the main method to use for manual update checking, like in Next.js _document
   */
  async checkForUpdates(): Promise<{
    hasUpdates: boolean;
    updatedRemotes: string[];
  }> {
    try {
      const remotesFromAPI = getAllKnownRemotes() as Record<
        string,
        { entry: string }
      >;
      const updatedRemotes: string[] = [];
      let hasUpdates = false;

      // Check each remote for updates
      for (const remoteName in remotesFromAPI) {
        const container = remotesFromAPI[remoteName];
        const url = container.entry;

        if (!url) continue;

        try {
          const response = await getFetchModule()(url);
          const content = await response.text();
          const newHash = crypto
            .createHash('md5')
            .update(content)
            .digest('hex');

          const currentHash = hashmap[remoteName];
          if (currentHash && currentHash !== newHash) {
            console.log(
              `[Module Federation HMR] Update detected for remote '${remoteName}'`,
            );
            updatedRemotes.push(remoteName);
            hasUpdates = true;
            hashmap[remoteName] = newHash;
          } else if (!currentHash) {
            // First time seeing this remote
            hashmap[remoteName] = newHash;
          }
        } catch (error) {
          console.warn(
            `[Module Federation HMR] Error checking remote '${remoteName}':`,
            error,
          );
        }
      }

      return { hasUpdates, updatedRemotes };
    } catch (error) {
      console.error(
        '[Module Federation HMR] Error checking for updates:',
        error,
      );
      return { hasUpdates: false, updatedRemotes: [] };
    }
  },

  /**
   * Apply HMR updates if any are detected
   * Returns true if updates were successfully applied
   */
  async applyUpdates(): Promise<boolean> {
    return await triggerHMRUpdate();
  },

  /**
   * Check for updates and apply them if found
   * This combines checkForUpdates() and applyUpdates() in one call
   * This is what revalidate() uses internally
   */
  async checkAndApplyUpdates(): Promise<boolean> {
    const { hasUpdates } = await this.checkForUpdates();
    if (hasUpdates) {
      return await this.applyUpdates();
    }
    return false;
  },

  /**
   * Force HMR reload regardless of change detection
   */
  async forceReload(): Promise<boolean> {
    console.log('[Module Federation HMR] Forcing HMR reload...');
    return await performReload(true);
  },

  /**
   * Get HMR client status and statistics
   */
  getStatus() {
    try {
      const hmrClient = getOrCreateHMRClient();
      return {
        ...hmrClient.getStatus(),
        knownRemotes: Object.keys(getAllKnownRemotes()),
        remoteHashes: { ...hashmap },
      };
    } catch (error) {
      console.error('[Module Federation HMR] Error getting status:', error);
      return null;
    }
  },
};
