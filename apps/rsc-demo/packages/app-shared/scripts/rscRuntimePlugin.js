'use strict';

/**
 * RSC Runtime Plugin for Module Federation
 *
 * This plugin provides RSC (React Server Components) integration with Module Federation:
 *
 * 1. **Server Actions (Option 2)**: When a remote's server-actions module is loaded via MF,
 *    this plugin automatically registers those actions with React's serverActionRegistry.
 *    This enables in-process execution of federated server actions without HTTP forwarding.
 *
 * 2. **Manifest-Driven Configuration**: Reads RSC metadata from federation manifest/stats to:
 *    - Discover remote's actionsEndpoint for HTTP fallback
 *    - Know which exposes are server-actions vs client-components
 *    - Get the server actions manifest URL
 *
 * 3. **Layer-Aware Share Resolution**: Uses rsc.layer and rsc.shareScope metadata
 *    to ensure proper share scope selection (rsc vs client vs ssr).
 *
 * Usage:
 *   runtimePlugins: [
 *     require.resolve('@module-federation/node/runtimePlugin'),
 *     require.resolve('./rscRuntimePlugin.js'),
 *   ]
 */

const LOG_PREFIX = '[RSC-MF]';
const DEBUG = process.env.RSC_MF_DEBUG === '1';
const fs = require('fs');
const path = require('path');

const FETCH_TIMEOUT_MS = 5000;

// Cache for remote RSC configs loaded from mf-stats.json
const remoteRSCConfigs = new Map();

// Cache for remote MF manifests (mf-stats.json)
const remoteMFManifests = new Map();

// Cache for remote server actions manifests
const remoteServerActionsManifests = new Map();

// Track which remotes have had their actions registered
const registeredRemotes = new Set();
// Track in-flight registrations to avoid double work
const registeringRemotes = new Map();

function getHostFromUrl(value) {
  try {
    const url = new URL(value);
    return url.host;
  } catch (_e) {
    return null;
  }
}

/**
 * Log helper - only logs if DEBUG is enabled
 */
function log(...args) {
  if (DEBUG) {
    console.log(LOG_PREFIX, ...args);
  }
}

function isResponseLike(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.json === 'function' &&
    typeof value.status === 'number'
  );
}

async function fetchJson(url, origin) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    let res;

    if (origin?.loaderHook?.lifecycle?.fetch?.emit) {
      try {
        res = await origin.loaderHook.lifecycle.fetch.emit(url, {
          signal: controller.signal,
        });
      } catch (_e) {
        // ignore and fall back to global fetch
      }
    }

    if (!isResponseLike(res)) {
      res = await fetch(url, { signal: controller.signal });
    }

    if (!isResponseLike(res) || !res.ok) {
      return null;
    }

    return await res.json();
  } catch (e) {
    log('Error fetching JSON', url, e?.message || String(e));
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getSiblingRemoteUrl(remoteEntryUrl, filename) {
  try {
    const url = new URL(filename, remoteEntryUrl);
    return url.href;
  } catch (_e) {
    return remoteEntryUrl.replace(/\/[^/]+$/, `/${filename}`);
  }
}

function getSiblingRemotePath(remoteEntryPath, filename) {
  return path.join(path.dirname(remoteEntryPath), filename);
}

/**
 * Fetch and cache a remote's mf-stats.json
 */
async function getMFManifest(remoteUrl, origin) {
  if (remoteMFManifests.has(remoteUrl)) return remoteMFManifests.get(remoteUrl);
  try {
    if (remoteUrl.startsWith('http')) {
      const candidates = [
        getSiblingRemoteUrl(remoteUrl, 'mf-manifest.server-stats.json'),
        getSiblingRemoteUrl(remoteUrl, 'mf-manifest.server.json'),
        getSiblingRemoteUrl(remoteUrl, 'mf-stats.json'),
        getSiblingRemoteUrl(remoteUrl, 'mf-manifest.json'),
      ];

      for (const statsUrl of candidates) {
        log('Fetching MF manifest from:', statsUrl);
        const json = await fetchJson(statsUrl, origin);
        if (!json) continue;

        // Prefer an RSC-layer manifest when available (server runtime plugin).
        const rsc = json?.rsc || json?.additionalData?.rsc || null;
        const isRscLayer = rsc?.isRSC === true || rsc?.layer === 'rsc';
        if (isRscLayer || statsUrl.includes('mf-manifest.server')) {
          remoteMFManifests.set(remoteUrl, json);
          return json;
        }
      }
      return null;
    }

    // File-based remote container; read mf-stats.json from disk (deprecated)
    const candidates = [
      getSiblingRemotePath(remoteUrl, 'mf-manifest.server-stats.json'),
      getSiblingRemotePath(remoteUrl, 'mf-manifest.server.json'),
      getSiblingRemotePath(remoteUrl, 'mf-stats.json'),
      getSiblingRemotePath(remoteUrl, 'mf-manifest.json'),
    ];

    const statsPath = candidates.find((p) => fs.existsSync(p));
    if (statsPath) {
      log(
        'WARNING: reading federation stats/manifest from disk; prefer HTTP for remotes.',
      );
      const json = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      remoteMFManifests.set(remoteUrl, json);
      return json;
    }
    log('Federation stats/manifest not found for', remoteUrl);
    return null;
  } catch (e) {
    log('Error fetching federation stats/manifest:', e.message);
    return null;
  }
}

/**
 * Fetch and cache a remote's mf-stats.json to get RSC config (+additionalData)
 */
async function getRemoteRSCConfig(remoteUrl, origin) {
  if (remoteRSCConfigs.has(remoteUrl)) {
    return remoteRSCConfigs.get(remoteUrl);
  }

  try {
    const stats = await getMFManifest(remoteUrl, origin);
    const additionalRsc = stats?.additionalData?.rsc || null;
    let rscConfig = stats?.rsc || additionalRsc || null;
    if (rscConfig && additionalRsc) {
      rscConfig = { ...additionalRsc, ...rscConfig };
    }
    if (stats?.additionalData && rscConfig) {
      rscConfig.additionalData = stats.additionalData;
    }
    // Avoid permanently caching null/empty config; allow retry (dev startup races).
    if (rscConfig) {
      remoteRSCConfigs.set(remoteUrl, rscConfig);
    }
    log('Loaded RSC config:', JSON.stringify(rscConfig, null, 2));
    return rscConfig;
  } catch (error) {
    log('Error fetching RSC config:', error.message);
    return null;
  }
}

/**
 * Fetch and cache a remote's server actions manifest
 */
async function getRemoteServerActionsManifest(remoteUrl, origin) {
  if (remoteServerActionsManifests.has(remoteUrl)) {
    return remoteServerActionsManifests.get(remoteUrl);
  }

  try {
    const rscConfig = await getRemoteRSCConfig(remoteUrl, origin);
    let manifestUrl =
      rscConfig?.serverActionsManifest ||
      rscConfig?.additionalData?.serverActionsManifest ||
      (rscConfig?.remote?.actionsEndpoint
        ? rscConfig.remote.actionsEndpoint.replace(
            /\/react$/,
            '/react-server-actions-manifest.json',
          )
        : null) ||
      getSiblingRemoteUrl(remoteUrl, 'react-server-actions-manifest.json');

    log('Fetching server actions manifest from:', manifestUrl);

    if (manifestUrl.startsWith('http')) {
      const manifest = await fetchJson(manifestUrl, origin);
      if (!manifest) return null;
      remoteServerActionsManifests.set(remoteUrl, manifest);
      log(
        'Loaded server actions manifest with',
        Object.keys(manifest).length,
        'actions',
      );
      return manifest;
    }

    if (!fs.existsSync(manifestUrl)) {
      log('Server actions manifest not found at', manifestUrl);
      return null;
    }
    log(
      'WARNING: loading server actions manifest from disk; prefer HTTP manifest.',
    );
    const manifest = JSON.parse(fs.readFileSync(manifestUrl, 'utf8'));
    remoteServerActionsManifests.set(remoteUrl, manifest);
    log(
      'Loaded server actions manifest with',
      Object.keys(manifest).length,
      'actions (fs)',
    );
    return manifest;
  } catch (error) {
    log('Error fetching server actions manifest:', error.message);
    return null;
  }
}

/**
 * Register server actions from a loaded module
 */
function registerServerActionsFromModule(remoteName, exposeModule, manifest) {
  if (!exposeModule || !manifest) {
    return 0;
  }

  let registeredCount = 0;

  try {
    // Get registerServerReference from react-server-dom-webpack/server
    // This is available because we're in the RSC layer
    const {
      registerServerReference,
    } = require('react-server-dom-webpack/server');

    for (const [actionId, entry] of Object.entries(manifest)) {
      if (!entry || !entry.id || !entry.name) {
        continue;
      }

      const exportName = entry.name;
      const fn =
        exportName === 'default'
          ? exposeModule.default
          : exposeModule[exportName];

      if (typeof fn === 'function') {
        registerServerReference(fn, entry.id, exportName);
        registeredCount++;
        log(`Registered action: ${actionId} -> ${exportName}`);
      }
    }
  } catch (error) {
    log('Error registering server actions:', error.message);
  }

  return registeredCount;
}

async function registerRemoteActionsAtInit(
  remoteInfo,
  remoteEntryExports,
  origin,
) {
  const remoteName =
    remoteInfo?.name || remoteInfo?.entryGlobalName || 'remote';
  const remoteEntry = remoteInfo?.entry;
  const registrationKey = `${remoteName}:server-actions:init`;

  if (registeredRemotes.has(registrationKey)) {
    return;
  }
  if (registeringRemotes.has(registrationKey)) {
    return registeringRemotes.get(registrationKey);
  }

  const work = (async () => {
    try {
      if (!remoteEntry) return;

      const rscConfig = await getRemoteRSCConfig(remoteEntry, origin);
      const exposeTypes =
        rscConfig?.exposeTypes && typeof rscConfig.exposeTypes === 'object'
          ? rscConfig.exposeTypes
          : null;
      const exposesToRegister = new Set();
      if (exposeTypes) {
        for (const [key, type] of Object.entries(exposeTypes)) {
          if (type === 'server-action' && typeof key === 'string') {
            exposesToRegister.add(key);
          }
        }
      }
      if (exposesToRegister.size === 0) {
        log('No server-action exposes declared for', remoteName);
        return;
      }

      const manifest = await getRemoteServerActionsManifest(
        remoteEntry,
        origin,
      );
      if (!manifest) {
        log('No server actions manifest during init for', remoteName);
        return;
      }

      if (!remoteEntryExports?.get) {
        log('remoteEntryExports.get is missing for', remoteName);
        return;
      }

      for (const exposeKey of exposesToRegister) {
        const factory = await remoteEntryExports.get(exposeKey);
        if (!factory) continue;
        const exposeModule = await factory();
        const count = registerServerActionsFromModule(
          remoteName,
          exposeModule,
          manifest,
        );
        if (count > 0) {
          registeredRemotes.add(registrationKey);
          registeredRemotes.add(`${remoteName}:${exposeKey}`);
          log(
            `Registered ${count} server actions at init for ${remoteName}:${exposeKey}`,
          );
        }
      }
    } catch (error) {
      log('Error registering actions at init for', remoteName, error.message);
    } finally {
      registeringRemotes.delete(registrationKey);
    }
  })();

  registeringRemotes.set(registrationKey, work);
  return work;
}

function rscRuntimePlugin() {
  return {
    name: 'rsc-runtime-plugin',
    version: '1.0.0',

    /**
     * afterResolve: After a remote module is resolved, we can access remote info
     */
    async afterResolve(args) {
      log(
        'afterResolve - id:',
        args.id,
        'expose:',
        args.expose,
        'remote:',
        args.remote?.name,
      );

      // Pre-fetch RSC config for this remote if we haven't already
      if (args.remote?.entry && !remoteRSCConfigs.has(args.remote.entry)) {
        // Don't await - let it happen in background
        getRemoteRSCConfig(args.remote.entry, args.origin).catch(() => {});
      }

      return args;
    },

    /**
     * onLoad: When a remote module is loaded, register server actions if applicable
     *
     * This is the key hook for Option 2 (MF-native server actions):
     * - Detect if the loaded module is a server-actions expose
     * - Fetch the remote's server actions manifest
     * - Register each action with React's serverActionRegistry
     */
    async onLoad(args) {
      log('onLoad - expose:', args.expose, 'remote:', args.remote?.name);

      // Only process server-actions exposes from remotes
      if (!args.remote || !args.expose) {
        return args;
      }

      const remoteName = args.remote.name;
      const remoteEntry = args.remote.entry;
      const exposeKey = args.expose;

      // Check if this is a server-actions module
      // We can detect this by:
      // - RSC config from mf-manifest additionalData.rsc.exposeTypes
      const rscConfig = await getRemoteRSCConfig(remoteEntry, args.origin);
      const exposeTypes =
        rscConfig?.exposeTypes && typeof rscConfig.exposeTypes === 'object'
          ? rscConfig.exposeTypes
          : null;
      const isServerActionsExpose =
        !!exposeTypes && exposeTypes[exposeKey] === 'server-action';

      if (!isServerActionsExpose) {
        log('Not a server-actions expose, skipping registration');
        return args;
      }

      // Skip if already registered
      const registrationKey = `${remoteName}:${exposeKey}`;
      if (registeredRemotes.has(registrationKey)) {
        log('Actions already registered for', registrationKey);
        return args;
      }

      log('Detected server-actions expose, attempting registration...');

      // Get the RSC config to validate and get manifest URL
      // Fetch the server actions manifest
      const manifest = await getRemoteServerActionsManifest(
        remoteEntry,
        args.origin,
      );
      if (!manifest) {
        log('No server actions manifest available for', remoteName);
        return args;
      }

      // Get the loaded module
      const exposeModule = args.exposeModule;
      if (!exposeModule) {
        log('No exposeModule available');
        return args;
      }

      // Register the server actions
      const count = registerServerActionsFromModule(
        remoteName,
        exposeModule,
        manifest,
      );

      if (count > 0) {
        registeredRemotes.add(registrationKey);
        log(
          `Registered ${count} server actions from ${remoteName}:${exposeKey}`,
        );
      }

      return args;
    },

    /**
     * initContainer: After remote container init, eagerly register server-action exposes
     * so server actions are available before first request.
     */
    async initContainer(args) {
      log(
        'initContainer - remote:',
        args.remoteInfo?.name,
        'entry:',
        args.remoteInfo?.entry,
      );

      await registerRemoteActionsAtInit(
        args.remoteInfo,
        args.remoteEntryExports,
        args.origin,
      );

      return args;
    },
  };
}

// Export for use as runtime plugin
module.exports = rscRuntimePlugin;
module.exports.default = rscRuntimePlugin;

// Export utilities for external use (e.g., from api.server.js)
module.exports.getRemoteRSCConfig = getRemoteRSCConfig;
module.exports.getRemoteServerActionsManifest = getRemoteServerActionsManifest;
module.exports.registeredRemotes = registeredRemotes;
