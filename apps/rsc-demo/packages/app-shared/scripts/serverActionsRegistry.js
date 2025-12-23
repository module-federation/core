'use strict';

const registry = new Map();

function getRegistryKey(compiler) {
  const outputPath =
    compiler &&
    compiler.options &&
    compiler.options.output &&
    typeof compiler.options.output.path === 'string'
      ? compiler.options.output.path
      : null;
  if (outputPath && outputPath.length > 0) return outputPath;

  const context =
    compiler && compiler.options && typeof compiler.options.context === 'string'
      ? compiler.options.context
      : null;
  if (context && context.length > 0) return context;

  return process.cwd();
}

function ensureEntry(key) {
  if (registry.has(key)) return registry.get(key);

  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  const entry = {
    ready,
    resolveReady,
    resolved: false,
    modules: new Set(),
  };

  registry.set(key, entry);
  return entry;
}

function setServerActionModules(key, modules) {
  const entry = ensureEntry(key);
  entry.modules = new Set(modules || []);
  if (!entry.resolved) {
    entry.resolved = true;
    entry.resolveReady();
  }
}

async function waitForServerActionModules(key, timeoutMs) {
  const entry = ensureEntry(key);

  if (entry.resolved) {
    return { modules: entry.modules, timedOut: false };
  }

  const timeout =
    typeof timeoutMs === 'number' && timeoutMs > 0 ? timeoutMs : 0;

  if (!timeout) {
    await entry.ready;
    return { modules: entry.modules, timedOut: false };
  }

  let timedOut = false;
  let timeoutId;
  try {
    await Promise.race([
      entry.ready,
      new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          timedOut = true;
          resolve();
        }, timeout);
        if (timeoutId && typeof timeoutId.unref === 'function') {
          timeoutId.unref();
        }
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
  return { modules: entry.modules, timedOut };
}

module.exports = {
  getRegistryKey,
  setServerActionModules,
  waitForServerActionModules,
};
