'use strict';

/**
 * AutoIncludeClientComponentsPlugin
 *
 * Ensures SSR bundles include the client component modules referenced by
 * `react-client-manifest.json`, and marks their exports as "used" so webpack
 * doesn't tree-shake them away. React reads these exports dynamically at
 * runtime (via the SSR resolver), so static analysis can't see the usage.
 */
class AutoIncludeClientComponentsPlugin {
  constructor(options = {}) {
    this.entryName = options.entryName || 'ssr';
    this.manifestFilename =
      options.manifestFilename || 'react-client-manifest.json';
  }

  apply(compiler) {
    compiler.hooks.finishMake.tapAsync(
      'AutoIncludeClientComponentsPlugin',
      async (compilation, callback) => {
        try {
          const { getEntryRuntime } = require('webpack/lib/util/runtime');
          const fs = require('fs');
          const path = require('path');

          const manifestPath = path.join(
            compiler.options.output.path,
            this.manifestFilename,
          );
          if (!fs.existsSync(manifestPath)) return callback();

          const clientManifest = JSON.parse(
            fs.readFileSync(manifestPath, 'utf8'),
          );
          const entries = Object.values(clientManifest || {});
          if (!entries.length) return callback();

          const runtime = getEntryRuntime(compilation, this.entryName);

          let SingleEntryDependency;
          try {
            // webpack >= 5.98
            SingleEntryDependency = require('webpack/lib/dependencies/SingleEntryDependency');
          } catch (_e) {
            // webpack <= 5.97
            SingleEntryDependency = require('webpack/lib/dependencies/EntryDependency');
          }

          const unique = new Set(
            entries
              .map((e) => e && e.id)
              .filter(Boolean)
              .map((moduleId) => {
                const withoutPrefix = String(moduleId).replace(
                  /^\(client\)\//,
                  '',
                );
                return withoutPrefix.startsWith('.')
                  ? withoutPrefix
                  : `./${withoutPrefix}`;
              }),
          );

          const includes = [...unique].map(
            (req) =>
              new Promise((resolve, reject) => {
                const dep = new SingleEntryDependency(req);
                dep.loc = { name: 'rsc-client-include' };
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
                        // best effort: don't fail the build if webpack internals change
                      }
                    }
                    resolve();
                  },
                );
              }),
          );

          await Promise.all(includes);
          callback();
        } catch (err) {
          callback(err);
        }
      },
    );
  }
}

module.exports = AutoIncludeClientComponentsPlugin;
module.exports.default = AutoIncludeClientComponentsPlugin;
