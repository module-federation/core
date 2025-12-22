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

const FETCH_TIMEOUT_MS = 5000;
const REMOTE_ACTION_PREFIX = 'remote:';
const CACHE_TTL_MS = Number(process.env.RSC_MF_CACHE_TTL_MS || 30000);

// Cache for remote RSC configs loaded from mf-stats.json
const remoteRSCConfigs = new Map();

// Cache for remote MF manifests (mf-stats.json)
const remoteMFManifests = new Map();

// Cache for remote server actions manifests
const remoteServerActionsManifests = new Map();

// Map actionId -> { remoteName, actionsEndpoint, remoteEntry }
const remoteActionIndex = new Map();

// Track which remotes have had their actions registered
const registeredRemotes = new Set();
// Track in-flight registrations to avoid double work
const registeringRemotes = new Map();

/**
 * Log helper - only logs if DEBUG is enabled
 */
function log(...args) {
  if (DEBUG) {
    console.log(LOG_PREFIX, ...args);
  }
}

function getCacheValue(cache, key, onExpire) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (!entry || typeof entry !== 'object' || !('value' in entry)) {
    return entry;
  }
  const ttl = Number.isFinite(CACHE_TTL_MS) ? CACHE_TTL_MS : 0;
  if (ttl > 0 && Date.now() - entry.timestamp > ttl) {
    cache.delete(key);
    if (typeof onExpire === 'function') {
      onExpire();
    }
    return null;
  }
  return entry.value;
}

function setCacheValue(cache, key, value) {
  cache.set(key, { value, timestamp: Date.now() });
  return value;
}

function resolveExplicitManifestUrl(remoteInfo) {
  if (!remoteInfo || typeof remoteInfo !== 'object') return null;
  const candidate =
    remoteInfo.manifestUrl ||
    remoteInfo.manifest ||
    remoteInfo.statsUrl ||
    remoteInfo.manifestFile;
  return typeof candidate === 'string' ? candidate : null;
}

function clearRemoteActionIndex(remoteEntry) {
  for (const [actionId, info] of remoteActionIndex.entries()) {
    if (info && info.remoteEntry === remoteEntry) {
      remoteActionIndex.delete(actionId);
    }
  }
}

function parseRemoteActionId(actionId) {
  if (typeof actionId !== 'string') return null;
  if (!actionId.startsWith(REMOTE_ACTION_PREFIX)) return null;
  const rest = actionId.slice(REMOTE_ACTION_PREFIX.length);
  const colonIndex = rest.indexOf(':');
  if (colonIndex <= 0) return null;
  const remoteName = rest.slice(0, colonIndex);
  const forwardedId = rest.slice(colonIndex + 1);
  if (!remoteName || !forwardedId) return null;
  return { remoteName, forwardedId };
}

function getFederationInstance(preferredName, origin) {
  if (origin && typeof origin === 'object' && origin.options) {
    return origin;
  }
  const instances = globalThis.__FEDERATION__?.__INSTANCES__;
  if (!Array.isArray(instances)) return null;
  if (preferredName) {
    return (
      instances.find((inst) => inst && inst.name === preferredName) ||
      instances[0]
    );
  }
  return instances[0] || null;
}

function getFederationRemotes(origin, preferredName) {
  const instance = getFederationInstance(preferredName, origin);
  const remotes = Array.isArray(instance?.options?.remotes)
    ? instance.options.remotes
    : [];
  return remotes
    .map((remote) => {
      if (!remote || typeof remote !== 'object') return null;
      const name = remote.name || remote.alias || remote.global || null;
      const entry = typeof remote.entry === 'string' ? remote.entry : null;
      if (!name || !entry) return null;
      return { name, entry, raw: remote };
    })
    .filter(Boolean);
}

function getActionsEndpoint(rscConfig, remoteEntry) {
  const remoteInfo = rscConfig?.remote || null;
  if (remoteInfo && typeof remoteInfo.actionsEndpoint === 'string') {
    return remoteInfo.actionsEndpoint;
  }
  if (remoteInfo && typeof remoteInfo.url === 'string') {
    try {
      const url = new URL('/react', remoteInfo.url);
      return url.href;
    } catch (_e) {
      return `${remoteInfo.url.replace(/\/$/, '')}/react`;
    }
  }
  if (typeof remoteEntry === 'string' && remoteEntry.startsWith('http')) {
    try {
      const url = new URL(remoteEntry);
      url.pathname = url.pathname.replace(/\/[^/]*$/, '/react');
      url.search = '';
      return url.href;
    } catch (_e) {
      return null;
    }
  }
  return null;
}

function indexRemoteActions(remoteEntry, manifest, rscConfig, remoteNameHint) {
  if (!manifest || typeof manifest !== 'object') return;
  const remoteInfo = rscConfig?.remote || null;
  const remoteName =
    remoteNameHint ||
    remoteInfo?.name ||
    remoteInfo?.entryGlobalName ||
    remoteInfo?.globalName ||
    null;
  const actionsEndpoint = getActionsEndpoint(rscConfig, remoteEntry);
  if (!remoteName || !actionsEndpoint) return;

  for (const actionId of Object.keys(manifest)) {
    if (!remoteActionIndex.has(actionId)) {
      remoteActionIndex.set(actionId, {
        remoteName,
        actionsEndpoint,
        remoteEntry,
      });
    }
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

/**
 * Fetch and cache a remote's mf-stats.json
 */
async function getMFManifest(remoteUrl, origin, remoteInfo) {
  const cached = getCacheValue(remoteMFManifests, remoteUrl);
  if (cached) return cached;
  try {
    const explicitManifestUrl = resolveExplicitManifestUrl(remoteInfo);
    if (!remoteUrl.startsWith('http') && !explicitManifestUrl) {
      // Demo/runtime assumes HTTP remotes so chunk loading + manifest resolution
      // behave like real deployments.
      log('Skipping non-HTTP remote entry (unsupported):', remoteUrl);
      return null;
    }

    // If the remote is already configured as a manifest URL (enhanced manifest
    // remotes), fetch it directly.
    let isManifestUrl = false;
    try {
      const url = new URL(remoteUrl);
      isManifestUrl =
        url.pathname.includes('mf-manifest') && url.pathname.endsWith('.json');
    } catch (_e) {
      isManifestUrl =
        remoteUrl.includes('mf-manifest') && remoteUrl.endsWith('.json');
    }

    // Deterministic manifest resolution (no guessing):
    // - RSC server containers publish `mf-manifest.server.json` next to remoteEntry.server.js
    // - Client containers publish `mf-manifest.json` next to remoteEntry.client.js
    // - SSR containers publish `mf-manifest.ssr.json` next to remoteEntry.ssr.js
    const manifestFileName = remoteUrl.includes('remoteEntry.server')
      ? 'mf-manifest.server.json'
      : remoteUrl.includes('remoteEntry.ssr')
        ? 'mf-manifest.ssr.json'
        : 'mf-manifest.json';

    const statsUrl = explicitManifestUrl
      ? explicitManifestUrl
      : isManifestUrl
        ? remoteUrl
        : getSiblingRemoteUrl(remoteUrl, manifestFileName);
    log('Fetching MF manifest from:', statsUrl);

    const json = await fetchJson(statsUrl, origin);
    if (!json) return null;

    return setCacheValue(remoteMFManifests, remoteUrl, json);
  } catch (e) {
    log('Error fetching federation stats/manifest:', e.message);
    return null;
  }
}

/**
 * Fetch and cache a remote's mf-stats.json to get RSC config (+additionalData)
 */
async function getRemoteRSCConfig(remoteUrl, origin, remoteInfo) {
  const cached = getCacheValue(remoteRSCConfigs, remoteUrl);
  if (cached) {
    return cached;
  }

  try {
    const stats = await getMFManifest(remoteUrl, origin, remoteInfo);
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
      setCacheValue(remoteRSCConfigs, remoteUrl, rscConfig);
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
async function getRemoteServerActionsManifest(remoteUrl, origin, remoteInfo) {
  const cached = getCacheValue(remoteServerActionsManifests, remoteUrl, () =>
    clearRemoteActionIndex(remoteUrl),
  );
  if (cached) {
    return cached;
  }

  try {
    const rscConfig = await getRemoteRSCConfig(remoteUrl, origin, remoteInfo);
    const manifestUrl =
      typeof rscConfig?.serverActionsManifest === 'string'
        ? rscConfig.serverActionsManifest
        : null;

    if (!manifestUrl) {
      // Remote may not support MF-native actions; caller can fall back to HTTP forwarding.
      return null;
    }

    log('Fetching server actions manifest from:', manifestUrl);
    if (!manifestUrl.startsWith('http')) return null;

    const manifest = await fetchJson(manifestUrl, origin);
    if (!manifest) return null;

    clearRemoteActionIndex(remoteUrl);
    setCacheValue(remoteServerActionsManifests, remoteUrl, manifest);
    indexRemoteActions(remoteUrl, manifest, rscConfig);
    log(
      'Loaded server actions manifest with',
      Object.keys(manifest).length,
      'actions',
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

      const rscConfig = await getRemoteRSCConfig(
        remoteEntry,
        origin,
        remoteInfo,
      );
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
        remoteInfo,
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

async function resolveRemoteAction(actionId, origin) {
  if (!actionId) return null;
  const parsed = parseRemoteActionId(actionId);
  const normalizedId = parsed ? parsed.forwardedId : actionId;

  const cached = remoteActionIndex.get(normalizedId);
  if (cached && (!parsed || parsed.remoteName === cached.remoteName)) {
    return { ...cached, forwardedId: normalizedId };
  }

  // Explicit remote prefix: resolve by remote name first, even if the manifest
  // isn't available yet. This keeps the explicit override path working.
  if (parsed) {
    const remotes = getFederationRemotes(origin, parsed.remoteName);
    const remote = remotes[0];
    if (!remote) return null;

    const rscConfig = await getRemoteRSCConfig(
      remote.entry,
      origin,
      remote.raw,
    );
    const actionsEndpoint = getActionsEndpoint(rscConfig, remote.entry);
    if (!actionsEndpoint) return null;

    // Best effort: load manifest to populate cache, but don't block explicit routing.
    await getRemoteServerActionsManifest(remote.entry, origin, remote.raw);

    return {
      remoteName: remote.name,
      actionsEndpoint,
      remoteEntry: remote.entry,
      forwardedId: normalizedId,
    };
  }

  const remotes = getFederationRemotes(origin);
  for (const remote of remotes) {
    const manifest = await getRemoteServerActionsManifest(
      remote.entry,
      origin,
      remote.raw,
    );
    if (manifest && manifest[normalizedId]) {
      // getRemoteServerActionsManifest indexes actions; pull from cache.
      const info = remoteActionIndex.get(normalizedId);
      if (info) {
        return { ...info, forwardedId: normalizedId };
      }
      // Fallback if index didn't populate for some reason.
      const rscConfig = await getRemoteRSCConfig(
        remote.entry,
        origin,
        remote.raw,
      );
      const actionsEndpoint = getActionsEndpoint(rscConfig, remote.entry);
      if (!actionsEndpoint) continue;
      return {
        remoteName: remote.name,
        actionsEndpoint,
        remoteEntry: remote.entry,
        forwardedId: normalizedId,
      };
    }
  }

  return null;
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
      if (
        args.remote?.entry &&
        !getCacheValue(remoteRSCConfigs, args.remote.entry)
      ) {
        // Don't await - let it happen in background
        getRemoteRSCConfig(args.remote.entry, args.origin, args.remote).catch(
          () => {},
        );
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
      const rscConfig = await getRemoteRSCConfig(
        remoteEntry,
        args.origin,
        args.remote,
      );
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
        args.remote,
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
module.exports.getFederationInstance = getFederationInstance;
module.exports.getFederationRemotes = getFederationRemotes;
module.exports.parseRemoteActionId = parseRemoteActionId;
module.exports.resolveRemoteAction = resolveRemoteAction;
module.exports.registeredRemotes = registeredRemotes;
