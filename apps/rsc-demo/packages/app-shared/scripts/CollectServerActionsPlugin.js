'use strict';

const { fileURLToPath } = require('url');
const {
  getRegistryKey,
  setServerActionModules,
  writeModulesToFile,
} = require('./serverActionsRegistry');

function getServerReferencesMap(compiler) {
  try {
    const loader = require('react-server-dom-webpack/rsc-client-loader');
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

class CollectServerActionsPlugin {
  constructor(options = {}) {
    this.stage = options.stage;
  }

  apply(compiler) {
    const webpack = require('webpack');
    const stage =
      typeof this.stage === 'number'
        ? this.stage
        : webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE;

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
      (compilation) => {
        compilation.hooks.processAssets.tap(
          {
            name: 'CollectServerActionsPlugin',
            stage,
          },
          () => {
            const serverReferencesMap = getServerReferencesMap(compiler);
            const modules = new Set();

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

            setServerActionModules(getRegistryKey(compiler), modules);

            try {
              writeModulesToFile(compiler, modules);
            } catch (error) {
              compilation.warnings.push(
                new webpack.WebpackError(
                  `CollectServerActionsPlugin: failed to write server action module registry (${error.message})`,
                ),
              );
            }
          },
        );
      },
    );
  }
}

module.exports = CollectServerActionsPlugin;
module.exports.default = CollectServerActionsPlugin;
