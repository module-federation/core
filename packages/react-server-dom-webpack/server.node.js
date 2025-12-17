'use strict';

var s;
if (process.env.NODE_ENV === 'production') {
  s = require('./cjs/react-server-dom-webpack-server.node.production.js');
} else {
  s = require('./cjs/react-server-dom-webpack-server.node.development.js');
}

// Use globalThis to ensure singleton registry across webpack module instances.
// This is necessary because webpack's share scope may create multiple module
// instances with different IDs that each execute this code.
const REGISTRY_KEY = '__RSC_SERVER_ACTION_REGISTRY__';
const MANIFEST_KEY = '__RSC_DYNAMIC_MANIFEST__';

// Global registry for inline server actions
// This allows action lookup for functions not exported from modules
if (!globalThis[REGISTRY_KEY]) {
  globalThis[REGISTRY_KEY] = new Map();
}
const serverActionRegistry = globalThis[REGISTRY_KEY];

// Dynamic manifest entries for actions registered at runtime (inline actions)
// Key: actionId, Value: { id, name, chunks }
if (!globalThis[MANIFEST_KEY]) {
  globalThis[MANIFEST_KEY] = new Map();
}
const dynamicServerActionsManifest = globalThis[MANIFEST_KEY];

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

  // Debug: log registration
  if (process.env.RSC_DEBUG) {
    console.log(
      `[RSC Registry] Registered action: ${actionId} (registry size: ${serverActionRegistry.size})`,
    );
  }

  // Also keep a manifest entry so decodeReply can resolve dynamic inline actions
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
  const result = serverActionRegistry.get(actionId);
  // Debug: log lookup
  if (process.env.RSC_DEBUG) {
    console.log(
      `[RSC Registry] Lookup action: ${actionId} -> ${result ? 'FOUND' : 'NOT FOUND'} (registry size: ${serverActionRegistry.size})`,
    );
    if (!result) {
      console.log(
        `[RSC Registry] Available actions: ${Array.from(serverActionRegistry.keys()).join(', ')}`,
      );
    }
  }
  return result;
}

function getDynamicServerActionsManifest() {
  const entries = {};
  for (const [key, value] of dynamicServerActionsManifest) {
    entries[key] = value;
  }
  return entries;
}

/**
 * Clear the server action registry (for testing purposes)
 * This is needed when reloading bundles in tests to ensure fresh state
 */
function clearServerActionRegistry() {
  serverActionRegistry.clear();
  dynamicServerActionsManifest.clear();
  if (process.env.RSC_DEBUG) {
    console.log('[RSC Registry] Cleared registry and manifest');
  }
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
exports.clearServerActionRegistry = clearServerActionRegistry;
