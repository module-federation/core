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
  registerServerReference,
} = require('react-server-dom-webpack/server');

// Import the app - this will be transformed by rsc-server-loader
// 'use client' components become client references
const ReactApp = require('./App').default;

// Import server action modules to ensure they are bundled and registered
// The rsc-server-loader will transform these to register the actions
require('./server-actions');
require('./test-default-action');
require('./inline-actions.server');

// Import shared module to ensure shared server actions are registered
// This is a node_module-style import for @rsc-demo/shared-rsc which contains
// both 'use client' (SharedClientWidget) and 'use server' (sharedServerActions)
// We import both the main module AND the server-actions directly to ensure
// the registerServerReference calls execute during module initialization.
require('@rsc-demo/shared-rsc');
require('@rsc-demo/shared-rsc/src/shared-server-actions.js');

// Import database for use by Express API routes
// This is bundled with the RSC layer to properly resolve 'server-only'
const { db: pool } = require('./db');

// Track whether we've registered remote (app2) actions via Module Federation.
// This is used by Option 2 (MF-native federated actions) so that app1 can
// execute app2's 'use server' functions in-process instead of HTTP forwarding.
let remoteApp2ActionsRegistered = false;

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
 *
 * @param {Object} serverActionsManifest - merged server actions manifest
 */
async function registerRemoteApp2Actions() {
  if (remoteApp2ActionsRegistered) {
    return;
  }

  // Trigger MF remote load; the rscRuntimePlugin will register actions once
  // the remote module is evaluated and its manifest is fetched via additionalData.
  try {
    await Promise.resolve(require('app2/server-actions'));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      '[Federation] Failed to load app2/server-actions via Module Federation:',
      error,
    );
    return;
  }

  remoteApp2ActionsRegistered = true;
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
