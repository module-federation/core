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

    // Clean up federation module caches
    const gs = new Function('return globalThis')();

    //@ts-ignore
    gs.__FEDERATION__.__INSTANCES__.map((i: any) => {
      //@ts-ignore
      i.moduleCache.forEach((mc: any) => {
        if (mc.remoteInfo && mc.remoteInfo.entryGlobalName) {
          delete gs[mc.remoteInfo.entryGlobalName];
        }
      });
      i.moduleCache.clear();
      if (gs[i.name]) {
        delete gs[i.name];
      }
    });
    //@ts-ignore
    __webpack_require__?.federation?.instance?.moduleCache?.clear();
    helpers.global.resetFederationGlobalInfo();
    globalThis.moduleGraphDirty = false;
    globalThis.mfHashMap = {};

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
      return false;
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
  return fetchModule(url)
    .then((re: Response) => {
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

  if (currentHash && currentHash !== newHash) {
    console.log(
      `[Module Federation HMR] Hash difference detected for ${remoteName}`,
    );
    console.log(
      `[Module Federation HMR] Old hash: ${currentHash}, New hash: ${newHash}`,
    );

    // Update the hash map
    hashmap[remoteName] = newHash;

    // Use HMR client to force apply update
    const hmrClient = getOrCreateHMRClient();
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
    hashmap[remoteName] = newHash;
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
  // Only perform HMR operations in browser environments
  if (typeof window === 'undefined') {
    // Server-side: just check for remote changes without applying HMR
    console.log(
      '[Module Federation] Server-side revalidate called - skipping HMR operations',
    );
    return false;
  }

  if (globalThis.moduleGraphDirty || force) {
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
