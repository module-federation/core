type CreateScriptNode = typeof import('./node').createScriptNode;
type LoadScriptNode = typeof import('./node').loadScriptNode;

const nodeExports = require('./node.cjs') as {
  createScriptNode: CreateScriptNode;
  loadScriptNode: LoadScriptNode;
};

export const { createScriptNode, loadScriptNode } = nodeExports;
