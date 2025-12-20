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
} = require('react-server-dom-webpack/server');

// Import the app - this will be transformed by rsc-server-loader
// 'use client' components become client references
const ReactApp = require('./App').default;

// Server Actions are auto-registered at startup by AutoRegisterServerActionsPlugin
// (webpack config) via a generated bootstrap module.
require('./__rsc_server_actions__.js');

// Import database for use by Express API routes
// This is bundled with the RSC layer to properly resolve 'server-only'
const { db: pool } = require('./db');

// Track whether we've registered remote (app2) actions via Module Federation.
// This is used by Option 2 (MF-native federated actions) so that app1 can
// execute app2's 'use server' functions in-process instead of HTTP forwarding.
let remoteApp2ActionsRegistered = false;

function getFederationInstance() {
  const instances = globalThis.__FEDERATION__?.__INSTANCES__;
  if (!Array.isArray(instances)) {
    return null;
  }
  return instances.find((inst) => inst && inst.name === 'app1') || instances[0];
}

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
 * Option 2: Register remote app2 server actions via Module Federation
 *
 * This function is called from the app1 Express server once the merged
 * react-server-actions-manifest.json has been loaded. It inspects the
 * manifest for entries that belong to app2's server-actions module and
 * registers those functions with the shared serverActionRegistry using
 * registerServerReference. Once registered, getServerAction(actionId)
 * in app1 can resolve these actions without an HTTP hop.
 */
async function registerRemoteApp2Actions() {
  if (remoteApp2ActionsRegistered) {
    return;
  }

  try {
    const federationInstance = getFederationInstance();
    if (
      !federationInstance ||
      typeof federationInstance.loadRemote !== 'function'
    ) {
      return;
    }

    const remoteName = 'app2';
    const remoteDef = Array.isArray(federationInstance.options?.remotes)
      ? federationInstance.options.remotes.find(
          (r) => r && (r.name === remoteName || r.alias === remoteName),
        )
      : null;
    const remoteEntry =
      remoteDef && typeof remoteDef.entry === 'string' ? remoteDef.entry : null;

    if (!remoteEntry) {
      return;
    }

    let rscRuntime;
    try {
      rscRuntime = require('../../app-shared/scripts/rscRuntimePlugin.js');
    } catch (_e) {
      rscRuntime = null;
    }

    const getRemoteRSCConfig =
      rscRuntime && typeof rscRuntime.getRemoteRSCConfig === 'function'
        ? rscRuntime.getRemoteRSCConfig
        : null;
    const getRemoteServerActionsManifest =
      rscRuntime &&
      typeof rscRuntime.getRemoteServerActionsManifest === 'function'
        ? rscRuntime.getRemoteServerActionsManifest
        : null;

    if (!getRemoteRSCConfig || !getRemoteServerActionsManifest) {
      return;
    }

    // If the remote container has already been initialized (e.g. because a server
    // component was imported), the runtime plugin may have registered actions
    // already. Avoid redundant remote loads by checking a real action id first.
    const rscConfig = await getRemoteRSCConfig(remoteEntry, federationInstance);
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
      return;
    }

    const remoteActionsManifest = await getRemoteServerActionsManifest(
      remoteEntry,
      federationInstance,
    );
    const sampleActionId =
      remoteActionsManifest && typeof remoteActionsManifest === 'object'
        ? Object.values(remoteActionsManifest).find(
            (v) => v && typeof v.id === 'string',
          )?.id
        : null;

    if (
      sampleActionId &&
      typeof getServerAction(sampleActionId) === 'function'
    ) {
      remoteApp2ActionsRegistered = true;
      return;
    }

    // Bootstrap the container via the first server-action expose declared in the
    // remote manifest. This keeps the host side manifest-driven (no hard-coded
    // expose keys) while still ensuring the remote is initialized on-demand.
    const bootstrapExpose = serverActionExposes[0];
    await federationInstance.loadRemote(
      `${remoteName}${bootstrapExpose.slice(1)}`,
      {
        loadFactory: false,
        from: 'runtime',
      },
    );

    if (
      sampleActionId &&
      typeof getServerAction(sampleActionId) === 'function'
    ) {
      remoteApp2ActionsRegistered = true;
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
  pool, // Database for Express API routes
  registerRemoteApp2Actions,
};
