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

module.exports = {
  ReactApp,
  renderApp,
  renderToPipeableStream,
  decodeReply,
  decodeReplyFromBusboy,
  getServerAction,
  getDynamicServerActionsManifest,
  pool, // Database for Express API routes
};
