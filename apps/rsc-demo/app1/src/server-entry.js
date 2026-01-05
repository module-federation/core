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

// Server Actions referenced by client code are auto-bootstrapped by
// ServerActionsBootstrapPlugin (webpack config).

// Import database for use by Express API routes
// This is bundled with the RSC layer to properly resolve 'server-only'
const { db: pool } = require('@rsc-demo/shared/server');

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
