'use strict';

const path = require('path');
const { fileURLToPath } = require('url');

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
    const resolved = require.resolve(
      'react-server-dom-webpack/rsc-client-loader',
      { paths: resolvePaths },
    );
    return require(resolved);
  } catch (_e) {
    try {
      return require('react-server-dom-webpack/rsc-client-loader');
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

function collectServerActionModulesFromCompilation(compilation) {
  const modules = new Set();
  if (!compilation || !compilation.modules) return modules;

  for (const mod of compilation.modules) {
    if (
      mod &&
      mod.buildInfo &&
      mod.buildInfo.rscDirective === 'use server' &&
      typeof mod.resource === 'string'
    ) {
      modules.add(mod.resource);
    }
  }

  return modules;
}

class ClientServerActionsBootstrapPlugin {
  constructor(options = {}) {
    this.entryName = options.entryName || 'main';
  }

  apply(compiler) {
    compiler.hooks.finishMake.tapPromise(
      'ClientServerActionsBootstrapPlugin',
      async (compilation) => {
        if (compilation.compiler.parentCompilation) {
          return;
        }
        const { getEntryRuntime } = require('webpack/lib/util/runtime');

        let SingleEntryDependency;
        try {
          // webpack >= 5.98
          SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency');
        } catch (_e) {
          // webpack <= 5.97
          SingleEntryDependency = require('webpack/lib/dependencies/EntryDependency');
        }

        let actionModules =
          collectServerActionModulesFromCompilation(compilation);
        if (!actionModules || actionModules.size === 0) {
          const serverReferencesMap = getServerReferencesMap(compiler);
          actionModules = collectServerActionModules(serverReferencesMap);
        }
        if (!actionModules || actionModules.size === 0) {
          return;
        }

        const runtime = getEntryRuntime(compilation, this.entryName);
        const includes = [...actionModules].map(
          (modulePath) =>
            new Promise((resolve, reject) => {
              const absolutePath = path.isAbsolute(modulePath)
                ? modulePath
                : path.resolve(compiler.context, modulePath);
              let relativePath = path.relative(compiler.context, absolutePath);
              if (!relativePath.startsWith('.')) {
                relativePath = `./${relativePath}`;
              }
              const request = relativePath.split(path.sep).join('/');
              const dep = new SingleEntryDependency(request);
              dep.loc = { name: 'rsc-client-server-action-include' };
              compilation.addInclude(
                compiler.context,
                dep,
                { name: this.entryName },
                (err, mod) => {
                  if (err) return reject(err);
                  if (mod) {
                    try {
                      compilation.moduleGraph
                        .getExportsInfo(mod)
                        .setUsedInUnknownWay(runtime);
                    } catch (_e) {
                      // best effort: don't fail build if webpack internals change
                    }
                  }
                  resolve();
                },
              );
            }),
        );

        await Promise.all(includes);
      },
    );
  }
}

module.exports = ClientServerActionsBootstrapPlugin;
module.exports.default = ClientServerActionsBootstrapPlugin;
