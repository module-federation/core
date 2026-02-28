'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = require('./cjs/react-server-dom-webpack-server.node.unbundled.production.js');
} else {
  s = require('./cjs/react-server-dom-webpack-server.node.unbundled.development.js');
}

// Global registry for inline server actions
// This allows action lookup for functions not exported from modules
const serverActionRegistry = new Map();

// Dynamic manifest entries for actions registered at runtime (inline actions)
const dynamicServerActionsManifest = new Map();

/**
 * Wrap registerServerReference to also store in global registry
 * This enables lookup of inline server actions defined inside components
 */
function registerServerReferenceWithRegistry(reference, id, exportName) {
  // Call the original implementation
  const result = s.registerServerReference(reference, id, exportName);

  // Store in global registry for lookup
  const actionId = exportName === null ? id : id + '#' + exportName;
  serverActionRegistry.set(actionId, reference);

  // Keep a manifest entry so decodeReply can resolve dynamic inline actions
  dynamicServerActionsManifest.set(actionId, {
    id,
    name: exportName === null ? 'default' : exportName,
    chunks: [],
  });

  return result;
}

/**
 * Get a server action function by its ID
 * Used by action handlers to find inline server actions
 */
function getServerAction(actionId) {
  return serverActionRegistry.get(actionId);
}

function getDynamicServerActionsManifest() {
  const entries = {};
  for (const [key, value] of dynamicServerActionsManifest) {
    entries[key] = value;
  }
  return entries;
}

exports.renderToReadableStream = s.renderToReadableStream;
exports.renderToPipeableStream = s.renderToPipeableStream;
exports.decodeReply = s.decodeReply;
exports.decodeReplyFromBusboy = s.decodeReplyFromBusboy;
exports.decodeReplyFromAsyncIterable = s.decodeReplyFromAsyncIterable;
exports.decodeAction = s.decodeAction;
exports.decodeFormState = s.decodeFormState;
exports.registerServerReference = registerServerReferenceWithRegistry;
exports.registerClientReference = s.registerClientReference;
exports.createClientModuleProxy = s.createClientModuleProxy;
exports.createTemporaryReferenceSet = s.createTemporaryReferenceSet;

// Export registry access for action handlers
exports.getServerAction = getServerAction;
exports.serverActionRegistry = serverActionRegistry;
exports.getDynamicServerActionsManifest = getDynamicServerActionsManifest;
