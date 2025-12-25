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
    this.waitTimeoutMs =
      typeof options.waitTimeoutMs === 'number'
        ? options.waitTimeoutMs
        : 120000;
    this.pollIntervalMs =
      typeof options.pollIntervalMs === 'number' ? options.pollIntervalMs : 50;
  }

  apply(compiler) {
    compiler.hooks.finishMake.tapAsync(
      'AutoIncludeClientComponentsPlugin',
      async (compilation, callback) => {
        try {
          const { getEntryRuntime } = require('webpack/lib/util/runtime');
          const path = require('path');

          const manifestPath = path.join(
            compiler.options.output.path,
            this.manifestFilename,
          );
          const outputPath = compiler.options.output.path;

          const timeoutMs =
            typeof this.waitTimeoutMs === 'number' && this.waitTimeoutMs > 0
              ? this.waitTimeoutMs
              : 0;
          const intervalMs =
            typeof this.pollIntervalMs === 'number' && this.pollIntervalMs > 0
              ? this.pollIntervalMs
              : 50;

          const waitForJsonFile = async (filePath) => {
            const start = Date.now();
            const registryKey = `${outputPath}::${this.manifestFilename}`;

            const getCachedManifest = () => {
              try {
                const registry =
                  globalThis && globalThis.__MF_RSC_CLIENT_MANIFEST_REGISTRY__;
                if (registry && typeof registry.get === 'function') {
                  const cached = registry.get(registryKey);
                  if (cached && typeof cached === 'object') return cached;
                }
              } catch (_e) {
                // ignore
              }
              return null;
            };

            // In multi-compiler builds, the client manifest may be emitted by a
            // different compiler. Wait for it so SSR includes the right modules.
            while (true) {
              const cached = getCachedManifest();
              if (cached) return cached;

              if (timeoutMs > 0 && Date.now() - start > timeoutMs) {
                throw new Error(
                  `AutoIncludeClientComponentsPlugin: timed out waiting for ${filePath}. ` +
                    'Ensure the client build runs and emits react-client-manifest.json before SSR finishes.',
                );
              }

              await new Promise((resolve) => setTimeout(resolve, intervalMs));
            }
          };

          const clientManifest = await waitForJsonFile(manifestPath);
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
