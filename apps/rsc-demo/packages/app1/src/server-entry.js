/**
 * Server Entry Point (RSC Layer)
 *
 * This file is bundled with webpack using resolve.conditionNames: ['react-server', ...]
 * which means all React imports get the server versions at BUILD time.
 *
 * No --conditions=react-server flag needed at runtime!
 */

'use strict';

const React = require('react');
const {
  renderToPipeableStream,
  decodeReply,
  decodeReplyFromBusboy,
  getServerAction,
  getDynamicServerActionsManifest,
  serverActionRegistry,
} = require('react-server-dom-webpack/server');

// Import the app - this will be transformed by rsc-server-loader
// 'use client' components become client references
const ReactApp = require('./App').default;

// Server Actions referenced by client code are auto-bootstrapped by
// ServerActionsBootstrapPlugin (webpack config).

// Import database for use by Express API routes
// This is bundled with the RSC layer to properly resolve 'server-only'
const { db: pool } = require('./db');

// Track whether we've registered remote actions via Module Federation.
// This is used by Option 2 (MF-native federated actions) so that app1 can
// execute remote 'use server' functions in-process instead of HTTP forwarding.
const remoteActionsRegistered = new Set();

let rscRuntime;
try {
  rscRuntime = require('../../app-shared/scripts/rscRuntimePlugin.js');
} catch (_e) {
  rscRuntime = null;
}

const getFederationInstance =
  rscRuntime && typeof rscRuntime.getFederationInstance === 'function'
    ? rscRuntime.getFederationInstance
    : null;
const getFederationRemotes =
  rscRuntime && typeof rscRuntime.getFederationRemotes === 'function'
    ? rscRuntime.getFederationRemotes
    : null;
const getRemoteRSCConfig =
  rscRuntime && typeof rscRuntime.getRemoteRSCConfig === 'function'
    ? rscRuntime.getRemoteRSCConfig
    : null;
const getRemoteServerActionsManifest =
  rscRuntime && typeof rscRuntime.getRemoteServerActionsManifest === 'function'
    ? rscRuntime.getRemoteServerActionsManifest
    : null;
const indexRemoteActionIds =
  rscRuntime && typeof rscRuntime.indexRemoteActionIds === 'function'
    ? rscRuntime.indexRemoteActionIds
    : null;
const getIndexedRemoteAction =
  rscRuntime && typeof rscRuntime.getIndexedRemoteAction === 'function'
    ? rscRuntime.getIndexedRemoteAction
    : null;

/**
 * Render the React app to a pipeable Flight stream
 * @param {Object} props - Props to pass to ReactApp
 * @param {Object} moduleMap - Client manifest for client component references
 */
function renderApp(props, moduleMap) {
  return renderToPipeableStream(
    React.createElement(ReactApp, props),
    moduleMap,
  );
}

/**
 * Option 2: Register remote server actions via Module Federation
 *
 * This function is called from the app1 Express server once the merged
 * react-server-actions-manifest.json has been loaded. It inspects the
 * manifest for entries that belong to remote server-actions modules and
 * registers those functions with the shared serverActionRegistry using
 * registerServerReference. Once registered, getServerAction(actionId)
 * in app1 can resolve these actions without an HTTP hop.
 */
async function registerRemoteActions() {
  try {
    if (
      !getFederationInstance ||
      !getFederationRemotes ||
      !getRemoteRSCConfig
    ) {
      return;
    }

    const federationInstance = getFederationInstance('app1');
    if (
      !federationInstance ||
      typeof federationInstance.loadRemote !== 'function'
    ) {
      return;
    }

    const remotes = getFederationRemotes(federationInstance);
    if (!remotes.length) return;

    const snapshotActionIds = () => {
      try {
        if (
          serverActionRegistry &&
          typeof serverActionRegistry.keys === 'function'
        ) {
          return new Set(serverActionRegistry.keys());
        }
        return new Set();
      } catch (_e) {
        return new Set();
      }
    };

    for (const remote of remotes) {
      if (!remote || remoteActionsRegistered.has(remote.name)) continue;
      if (!remote.entry) continue;

      const rscConfig = await getRemoteRSCConfig(
        remote.entry,
        federationInstance,
        remote.raw,
      );
      const exposeTypes =
        rscConfig?.exposeTypes && typeof rscConfig.exposeTypes === 'object'
          ? rscConfig.exposeTypes
          : null;
      const serverActionExposes = exposeTypes
        ? Object.keys(exposeTypes)
            .filter((k) => exposeTypes[k] === 'server-action')
            .sort()
        : [];

      if (serverActionExposes.length === 0) {
        continue;
      }

      const remoteActionsManifest = getRemoteServerActionsManifest
        ? await getRemoteServerActionsManifest(
            remote.entry,
            federationInstance,
            remote.raw,
          )
        : null;

      const actionEntries =
        remoteActionsManifest && typeof remoteActionsManifest === 'object'
          ? Object.values(remoteActionsManifest).filter(
              (v) => v && typeof v.id === 'string',
            )
          : [];

      const getMissingActionIds = () =>
        actionEntries
          .map((entry) => entry.id)
          .filter((id) => typeof getServerAction(id) !== 'function');

      let missingActionIds = getMissingActionIds();
      if (missingActionIds.length === 0 && actionEntries.length > 0) {
        remoteActionsRegistered.add(remote.name);
        continue;
      }

      // Bootstrap all server-action exposes so each action can be registered.
      // We stop early if every action in the manifest is already registered.
      for (const exposeKey of serverActionExposes) {
        const beforeIds = indexRemoteActionIds ? snapshotActionIds() : null;
        await federationInstance.loadRemote(
          `${remote.name}${exposeKey.slice(1)}`,
          {
            loadFactory: false,
            from: 'runtime',
          },
        );

        if (indexRemoteActionIds && beforeIds) {
          const afterIds = snapshotActionIds();
          const newlyRegistered = [];
          for (const actionId of afterIds) {
            if (!beforeIds.has(actionId)) {
              newlyRegistered.push(actionId);
            }
          }

          if (newlyRegistered.length > 0) {
            indexRemoteActionIds(
              remote.entry,
              newlyRegistered,
              rscConfig,
              remote.name,
            );
          }
        }

        missingActionIds = getMissingActionIds();
        if (missingActionIds.length === 0 && actionEntries.length > 0) {
          remoteActionsRegistered.add(remote.name);
          break;
        }
      }

      if (missingActionIds.length === 0 && actionEntries.length > 0) {
        remoteActionsRegistered.add(remote.name);
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Federation] Failed to register remote actions:', error);
  }
}

module.exports = {
  ReactApp,
  renderApp,
  renderToPipeableStream,
  decodeReply,
  decodeReplyFromBusboy,
  getServerAction,
  getDynamicServerActionsManifest,
  getIndexedRemoteAction,
  pool, // Database for Express API routes
  registerRemoteActions,
};
