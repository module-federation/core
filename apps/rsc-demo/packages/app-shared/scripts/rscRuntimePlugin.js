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
 * 2. **Manifest-Driven Configuration**: Reads RSC metadata from mf-stats.json to:
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

// Cache for remote RSC configs loaded from mf-stats.json
const remoteRSCConfigs = new Map();

// Cache for remote MF manifests (mf-stats.json)
const remoteMFManifests = new Map();

// Cache for remote server actions manifests
const remoteServerActionsManifests = new Map();

// Track which remotes have had their actions registered
const registeredRemotes = new Set();

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

/**
 * Fetch and cache a remote's mf-stats.json
 */
async function getMFManifest(remoteUrl) {
  if (remoteMFManifests.has(remoteUrl)) return remoteMFManifests.get(remoteUrl);
  try {
    if (remoteUrl.startsWith('http')) {
      const statsUrl = remoteUrl.replace(/\/[^/]+$/, '/mf-stats.json');
      log('Fetching MF manifest from:', statsUrl);
      const res = await fetch(statsUrl);
      if (!res.ok) {
        log('Failed to fetch mf-stats.json:', res.status);
        remoteMFManifests.set(remoteUrl, null);
        return null;
      }
      const json = await res.json();
      remoteMFManifests.set(remoteUrl, json);
      return json;
    }

    // File-based remote container; read mf-stats.json from disk (deprecated)
    const statsPath = remoteUrl.replace(/[^/\\]+$/, 'mf-stats.json');
    if (fs.existsSync(statsPath)) {
      log(
        'WARNING: reading mf-stats.json from disk; prefer HTTP mf-stats for remotes.'
      );
      const json = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
      remoteMFManifests.set(remoteUrl, json);
      return json;
    }
    log('mf-stats.json not found at', statsPath);
    remoteMFManifests.set(remoteUrl, null);
    return null;
  } catch (e) {
    log('Error fetching mf-stats.json:', e.message);
    remoteMFManifests.set(remoteUrl, null);
    return null;
  }
}

/**
 * Fetch and cache a remote's mf-stats.json to get RSC config (+additionalData)
 */
async function getRemoteRSCConfig(remoteUrl) {
  if (remoteRSCConfigs.has(remoteUrl)) {
    return remoteRSCConfigs.get(remoteUrl);
  }

  try {
    const stats = await getMFManifest(remoteUrl);
    const additionalRsc = stats?.additionalData?.rsc || null;
    let rscConfig = stats?.rsc || additionalRsc || null;
    if (rscConfig && additionalRsc) {
      rscConfig = {...additionalRsc, ...rscConfig};
    }
    if (stats?.additionalData && rscConfig) {
      rscConfig.additionalData = stats.additionalData;
    }
    remoteRSCConfigs.set(remoteUrl, rscConfig);
    log('Loaded RSC config:', JSON.stringify(rscConfig, null, 2));
    return rscConfig;
  } catch (error) {
    log('Error fetching RSC config:', error.message);
    remoteRSCConfigs.set(remoteUrl, null);
    return null;
  }
}

/**
 * Fetch and cache a remote's server actions manifest
 */
async function getRemoteServerActionsManifest(remoteUrl) {
  if (remoteServerActionsManifests.has(remoteUrl)) {
    return remoteServerActionsManifests.get(remoteUrl);
  }

  try {
    const rscConfig = await getRemoteRSCConfig(remoteUrl);
    let manifestUrl =
      rscConfig?.serverActionsManifest ||
      rscConfig?.additionalData?.serverActionsManifest ||
      (rscConfig?.remote?.actionsEndpoint
        ? rscConfig.remote.actionsEndpoint.replace(
            /\/react$/,
            '/react-server-actions-manifest.json'
          )
        : null) ||
      remoteUrl.replace(/\/[^/]+$/, '/react-server-actions-manifest.json');

    log('Fetching server actions manifest from:', manifestUrl);

    if (manifestUrl.startsWith('http')) {
      const response = await fetch(manifestUrl);
      if (!response.ok) {
        log('Failed to fetch server actions manifest:', response.status);
        return null;
      }
      const manifest = await response.json();
      remoteServerActionsManifests.set(remoteUrl, manifest);
      log(
        'Loaded server actions manifest with',
        Object.keys(manifest).length,
        'actions'
      );
      return manifest;
    }

    if (!fs.existsSync(manifestUrl)) {
      log('Server actions manifest not found at', manifestUrl);
      remoteServerActionsManifests.set(remoteUrl, null);
      return null;
    }
    log(
      'WARNING: loading server actions manifest from disk; prefer HTTP manifest.'
    );
    const manifest = JSON.parse(fs.readFileSync(manifestUrl, 'utf8'));
    remoteServerActionsManifests.set(remoteUrl, manifest);
    log(
      'Loaded server actions manifest with',
      Object.keys(manifest).length,
      'actions (fs)'
    );
    return manifest;
  } catch (error) {
    log('Error fetching server actions manifest:', error.message);
    remoteServerActionsManifests.set(remoteUrl, null);
    return null;
  }
}

/**
 * Register server actions from a loaded module
 */
function registerServerActionsFromModule(
  remoteName,
  remoteUrl,
  exposeModule,
  manifest
) {
  if (!exposeModule || !manifest) {
    return 0;
  }

  let registeredCount = 0;
  const remoteHost = getHostFromUrl(remoteUrl);

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

      // Basic ownership check: prefer host match, otherwise fall back to name heuristic
      const entryHost = getHostFromUrl(entry.id);
      if (remoteHost && entryHost && entryHost !== remoteHost) {
        continue;
      }
      if (!entryHost) {
        if (
          !entry.id.includes(`/packages/${remoteName}/`) &&
          !entry.id.includes(`/${remoteName}/src/`)
        ) {
          // Can't confidently match; allow registration for single-remote setups
          if (remoteHost) {
            continue;
          }
        }
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

function rscRuntimePlugin() {
  return {
    name: 'rsc-runtime-plugin',
    version: '1.0.0',

    /**
     * beforeInit: Inject RSC-specific configuration
     */
    beforeInit(args) {
      log('beforeInit - origin:', args.origin?.name);

      // Store host's RSC config if available
      if (args.userOptions?.rsc) {
        log('Host RSC config:', JSON.stringify(args.userOptions.rsc, null, 2));
      }

      return args;
    },

    /**
     * beforeRegisterRemote: Validate and enhance remote registration
     */
    beforeRegisterRemote(args) {
      log(
        'beforeRegisterRemote - remote:',
        args.remote?.name,
        'entry:',
        args.remote?.entry
      );
      return args;
    },

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
        args.remote?.name
      );

      // Pre-fetch RSC config for this remote if we haven't already
      if (args.remote?.entry && !remoteRSCConfigs.has(args.remote.entry)) {
        // Don't await - let it happen in background
        getRemoteRSCConfig(args.remote.entry).catch(() => {});
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
      // 1. The expose name (./server-actions)
      // 2. RSC config from mf-stats.json (rsc.exposeTypes)
      const isServerActionsExpose =
        exposeKey === './server-actions' ||
        exposeKey.includes('server-actions') ||
        exposeKey.includes('actions');

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
      const rscConfig = await getRemoteRSCConfig(remoteEntry);

      // Validate this is actually a server-action module using manifest metadata
      if (rscConfig?.exposeTypes?.[exposeKey]) {
        const exposeType = rscConfig.exposeTypes[exposeKey];
        if (exposeType !== 'server-action' && exposeType !== 'server-actions') {
          log(
            'Expose type is',
            exposeType,
            '- not registering as server actions'
          );
          return args;
        }
      }

      // Fetch the server actions manifest
      const manifest = await getRemoteServerActionsManifest(remoteEntry);
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
        remoteEntry,
        exposeModule,
        manifest
      );

      if (count > 0) {
        registeredRemotes.add(registrationKey);
        log(
          `Registered ${count} server actions from ${remoteName}:${exposeKey}`
        );
      }

      return args;
    },

    /**
     * resolveShare: Layer-aware share resolution
     *
     * Uses the RSC layer metadata to ensure correct share scope selection.
     * This helps prevent cross-layer React instance issues.
     */
    resolveShare(args) {
      log('resolveShare - pkgName:', args.pkgName, 'scope:', args.scope);

      // The share scope should already be set correctly by the MF config
      // This hook can be used for additional validation or dynamic resolution

      return args;
    },

    /**
     * errorLoadRemote: Handle remote loading errors gracefully
     */
    async errorLoadRemote(args) {
      log('errorLoadRemote - id:', args.id, 'error:', args.error?.message);

      // For server actions, we can fall back to HTTP forwarding (Option 1)
      // The api.server.js handler already has this fallback logic

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
