'use strict';

const fs = require('fs');
const path = require('path');

const registry = new Map();
const REGISTRY_FILENAME = '__rsc_server_action_modules__.json';

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

function getRegistryPath(compiler) {
  const outputPath =
    compiler &&
    compiler.options &&
    compiler.options.output &&
    typeof compiler.options.output.path === 'string'
      ? compiler.options.output.path
      : null;
  const basePath =
    outputPath ||
    (compiler &&
    compiler.options &&
    typeof compiler.options.context === 'string'
      ? compiler.options.context
      : null) ||
    process.cwd();

  return path.join(basePath, REGISTRY_FILENAME);
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

function writeModulesToFile(compiler, modules) {
  const filePath = getRegistryPath(compiler);
  const payload = {
    version: 1,
    generatedAt: new Date().toISOString(),
    modules: Array.from(modules || []),
  };

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

function readModulesFromFile(compiler) {
  const filePath = getRegistryPath(compiler);
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.filter((value) => typeof value === 'string'));
    }
    if (parsed && Array.isArray(parsed.modules)) {
      return new Set(
        parsed.modules.filter((value) => typeof value === 'string'),
      );
    }
  } catch (_e) {
    return null;
  }

  return null;
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
  await Promise.race([
    entry.ready,
    new Promise((resolve) =>
      setTimeout(() => {
        timedOut = true;
        resolve();
      }, timeout),
    ),
  ]);
  return { modules: entry.modules, timedOut };
}

module.exports = {
  getRegistryKey,
  getRegistryPath,
  setServerActionModules,
  readModulesFromFile,
  writeModulesToFile,
  waitForServerActionModules,
};
