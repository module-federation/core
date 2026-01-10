import type { Compilation, Compiler } from 'webpack';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import {
  getRegistryKey,
  setServerActionModules,
} from './serverActionsRegistry';

const nodeRequire = createRequire(import.meta.url);

function resolveRscClientLoader(compiler) {
  const resolvePaths = [];
  const context =
    compiler && compiler.options && typeof compiler.options.context === 'string'
      ? compiler.options.context
      : null;
  if (context) resolvePaths.push(context);
  if (
    compiler &&
    typeof compiler.context === 'string' &&
    compiler.context !== context
  ) {
    resolvePaths.push(compiler.context);
  }
  resolvePaths.push(process.cwd());

  try {
    const resolved = nodeRequire.resolve(
      '@module-federation/react-server-dom-webpack/rsc-client-loader',
      { paths: resolvePaths },
    );
    return nodeRequire(resolved);
  } catch (_e) {
    try {
      return nodeRequire(
        '@module-federation/react-server-dom-webpack/rsc-client-loader',
      );
    } catch (_e2) {
      return null;
    }
  }
}

function getServerReferencesMap(compiler) {
  try {
    const loader = resolveRscClientLoader(compiler);
    if (loader && typeof loader.getServerReferencesMap === 'function') {
      const outputPath =
        compiler &&
        compiler.options &&
        compiler.options.output &&
        typeof compiler.options.output.path === 'string'
          ? compiler.options.output.path
          : undefined;
      const primary = loader.getServerReferencesMap(outputPath);
      if (primary && primary.size > 0) return primary;
      const fallbackContext =
        compiler && typeof compiler.context === 'string'
          ? compiler.context
          : undefined;
      if (fallbackContext && fallbackContext !== outputPath) {
        const fallback = loader.getServerReferencesMap(fallbackContext);
        if (fallback && fallback.size > 0) return fallback;
      }
      return primary || new Map();
    }
    return loader && loader.serverReferencesMap
      ? loader.serverReferencesMap
      : new Map();
  } catch (_e) {
    return new Map();
  }
}

function collectServerActionModules(serverReferencesMap) {
  const modules = new Set();
  if (!serverReferencesMap) return modules;

  for (const [actionId, entry] of serverReferencesMap) {
    const moduleUrl =
      entry && typeof entry.id === 'string'
        ? entry.id
        : typeof actionId === 'string'
          ? actionId.split('#')[0]
          : null;

    if (!moduleUrl || !moduleUrl.startsWith('file:')) continue;

    try {
      modules.add(fileURLToPath(moduleUrl));
    } catch (_e) {
      // ignore invalid URLs
    }
  }

  return modules;
}

export default class CollectServerActionsPlugin {
  constructor(_options = {}) {}

  apply(compiler: Compiler) {
    compiler.hooks.beforeCompile.tap('CollectServerActionsPlugin', () => {
      const serverReferencesMap = getServerReferencesMap(compiler);
      if (
        serverReferencesMap &&
        typeof serverReferencesMap.clear === 'function'
      ) {
        serverReferencesMap.clear();
      }
    });

    compiler.hooks.thisCompilation.tap(
      'CollectServerActionsPlugin',
      (compilation: Compilation) => {
        compilation.hooks.finishModules.tap(
          'CollectServerActionsPlugin',
          () => {
            const serverReferencesMap = getServerReferencesMap(compiler);
            const modules = collectServerActionModules(serverReferencesMap);

            setServerActionModules(getRegistryKey(compiler), modules);
          },
        );
      },
    );
  }
}
