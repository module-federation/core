'use strict';

const path = require('path');
const VirtualModulesPlugin = require('webpack-virtual-modules');
const {
  getRegistryKey,
  waitForServerActionModules,
} = require('./serverActionsRegistry');

class ServerActionsBootstrapPlugin {
  constructor(options = {}) {
    this.entryName = options.entryName || 'server';
    this.waitTimeoutMs =
      typeof options.waitTimeoutMs === 'number'
        ? options.waitTimeoutMs
        : 120000;
  }

  apply(compiler) {
    const webpack = require('webpack');
    const EntryDependency = require('webpack/lib/dependencies/EntryDependency');
    const bootstrapPath = path.join(
      compiler.context,
      '__rsc_server_actions_bootstrap__.js',
    );

    const virtualModules = new VirtualModulesPlugin({
      [bootstrapPath]: '// bootstrap placeholder',
    });
    virtualModules.apply(compiler);

    const entryOptions =
      compiler.options &&
      compiler.options.entry &&
      typeof compiler.options.entry === 'object'
        ? compiler.options.entry
        : null;
    const mainEntry =
      entryOptions && !Array.isArray(entryOptions)
        ? entryOptions[this.entryName]
        : null;
    const mainEntryOptions =
      mainEntry && typeof mainEntry === 'object' ? mainEntry : null;
    const entryLayer = mainEntryOptions ? mainEntryOptions.layer : undefined;
    let entryRequest = null;
    if (typeof mainEntry === 'string') {
      entryRequest = mainEntry;
    } else if (Array.isArray(mainEntry) && mainEntry.length > 0) {
      entryRequest = mainEntry[0];
    } else if (mainEntryOptions && mainEntryOptions.import) {
      if (Array.isArray(mainEntryOptions.import)) {
        entryRequest = mainEntryOptions.import[0];
      } else {
        entryRequest = mainEntryOptions.import;
      }
    }

    const entryAdded = new WeakSet();

    compiler.hooks.compilation.tap(
      'ServerActionsBootstrapPlugin',
      (compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          EntryDependency,
          normalModuleFactory,
        );
      },
    );

    compiler.hooks.finishMake.tapPromise(
      'ServerActionsBootstrapPlugin',
      async (compilation) => {
        const registryKey = getRegistryKey(compiler);
        const result = await waitForServerActionModules(
          registryKey,
          this.waitTimeoutMs,
        );

        let actionModules = result ? result.modules : null;
        if (!actionModules || actionModules.size === 0) {
          if (result && result.timedOut) {
            compilation.errors.push(
              new webpack.WebpackError(
                'ServerActionsBootstrapPlugin: timed out waiting for client ' +
                  'server action discovery. Ensure CollectServerActionsPlugin ' +
                  'runs in the client build and both builds run in the same process.',
              ),
            );
            return;
          }
          virtualModules.writeModule(
            bootstrapPath,
            '// No server action modules discovered.',
          );
          return;
        }

        const lines = [];
        for (const modulePath of actionModules) {
          const absolutePath = path.isAbsolute(modulePath)
            ? modulePath
            : path.resolve(compiler.context, modulePath);
          let relativePath = path.relative(compiler.context, absolutePath);
          if (!relativePath.startsWith('.')) {
            relativePath = `./${relativePath}`;
          }
          const request = relativePath.split(path.sep).join('/');
          lines.push(`require('${request}');`);
        }

        if (entryRequest) {
          const entryAbsolute = path.isAbsolute(entryRequest)
            ? entryRequest
            : path.resolve(compiler.context, entryRequest);
          let entryRelative = path.relative(compiler.context, entryAbsolute);
          if (!entryRelative.startsWith('.')) {
            entryRelative = `./${entryRelative}`;
          }
          const entryModule = entryRelative.split(path.sep).join('/');
          lines.push(`module.exports = require('${entryModule}');`);
        }

        virtualModules.writeModule(bootstrapPath, lines.join('\n'));

        if (!entryAdded.has(compilation)) {
          const dep = new EntryDependency(bootstrapPath);
          dep.loc = { name: 'rsc-server-action-bootstrap' };
          await new Promise((resolve, reject) => {
            compilation.addEntry(
              compiler.context,
              dep,
              {
                name: this.entryName,
                layer: entryLayer,
              },
              (err) => {
                if (err) return reject(err);
                resolve();
              },
            );
          });
          entryAdded.add(compilation);
        }
      },
    );
  }
}

module.exports = ServerActionsBootstrapPlugin;
module.exports.default = ServerActionsBootstrapPlugin;
