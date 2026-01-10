import type { Compilation, Compiler } from 'webpack';
import { createRequire } from 'module';

const nodeRequire = createRequire(import.meta.url);
const { getWebpackPath, normalizeWebpackPath } = nodeRequire(
  '@module-federation/sdk/normalize-webpack-path',
);

/**
 * AutoIncludeClientComponentsPlugin
 *
 * Ensures SSR bundles include the client component modules referenced by
 * `react-client-manifest.json`, and marks their exports as "used" so webpack
 * doesn't tree-shake them away. React reads these exports dynamically at
 * runtime (via the SSR resolver), so static analysis can't see the usage.
 */
type AutoIncludeClientComponentsPluginOptions = {
  entryName?: string;
  manifestFilename?: string;
  waitTimeoutMs?: number;
  pollIntervalMs?: number;
};

export default class AutoIncludeClientComponentsPlugin {
  entryName: string;
  manifestFilename: string;
  waitTimeoutMs: number;
  pollIntervalMs: number;

  constructor(options: AutoIncludeClientComponentsPluginOptions = {}) {
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

  private getStringProp(obj: unknown, key: string): string | null {
    if (!obj || typeof obj !== 'object') return null;
    const record = obj as Record<string, unknown>;
    const value = record[key];
    return typeof value === 'string' ? value : null;
  }

  apply(compiler: Compiler) {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    compiler.hooks.finishMake.tapAsync(
      'AutoIncludeClientComponentsPlugin',
      async (compilation: Compilation, callback) => {
        try {
          const { getEntryRuntime } = nodeRequire(
            normalizeWebpackPath('webpack/lib/util/runtime'),
          ) as typeof import('webpack/lib/util/runtime');
          const path = nodeRequire('path');

          const manifestPath = path.join(
            compiler.options.output.path,
            this.manifestFilename,
          );
          const outputPath = compiler.options.output.path;

          const timeoutMs =
            typeof this.waitTimeoutMs === 'number' && this.waitTimeoutMs > 0
              ? this.waitTimeoutMs
              : 0;

          const waitForJsonFile = async (filePath: string) => {
            const registryKey = `${outputPath}::${this.manifestFilename}`;

            const registry = globalThis.__MF_RSC_CLIENT_MANIFEST_REGISTRY__;
            if (registry instanceof Map) {
              const cached = registry.get(registryKey);
              if (cached && typeof cached === 'object') return cached;
            }

            const waiters =
              globalThis.__MF_RSC_CLIENT_MANIFEST_WAITERS__ || new Map();
            if (!globalThis.__MF_RSC_CLIENT_MANIFEST_WAITERS__) {
              globalThis.__MF_RSC_CLIENT_MANIFEST_WAITERS__ = waiters;
            }

            let waiter = waiters.get(registryKey);
            if (!waiter) {
              let resolve!: (value: Record<string, unknown>) => void;
              const promise = new Promise<Record<string, unknown>>((res) => {
                resolve = res;
              });
              waiter = { promise, resolve };
              waiters.set(registryKey, waiter);
            }

            if (!timeoutMs) {
              return waiter.promise;
            }

            let timeoutId: ReturnType<typeof setTimeout> | undefined;
            const result = await Promise.race([
              waiter.promise,
              new Promise<Record<string, unknown> | null>((resolve) => {
                timeoutId = setTimeout(() => resolve(null), timeoutMs);
                if (timeoutId && typeof timeoutId.unref === 'function') {
                  timeoutId.unref();
                }
              }),
            ]);

            if (timeoutId) clearTimeout(timeoutId);
            if (!result) {
              throw new Error(
                `AutoIncludeClientComponentsPlugin: timed out waiting for ${filePath}. ` +
                  'Ensure the client build runs and emits react-client-manifest.json before SSR finishes.',
              );
            }
            return result;
          };

          const clientManifest = await waitForJsonFile(manifestPath);
          const entries = Object.values(clientManifest || {});
          if (!entries.length) return callback();

          const runtime = getEntryRuntime(compilation, this.entryName);

          let SingleEntryDependency;
          try {
            // webpack >= 5.98
            SingleEntryDependency = nodeRequire(
              normalizeWebpackPath(
                'webpack/lib/dependencies/SingleEntryDependency',
              ),
            );
          } catch (_e) {
            // webpack <= 5.97
            SingleEntryDependency = nodeRequire(
              normalizeWebpackPath('webpack/lib/dependencies/EntryDependency'),
            );
          }

          const unique = new Set(
            entries
              .map((entry) => this.getStringProp(entry, 'id'))
              .filter((moduleId): moduleId is string => !!moduleId)
              .map((moduleId) => {
                const withoutPrefix = moduleId.replace(/^\(client\)\//, '');
                return withoutPrefix.startsWith('.')
                  ? withoutPrefix
                  : `./${withoutPrefix}`;
              }),
          );

          const includes = [...unique].map(
            (req) =>
              new Promise<void>((resolve, reject) => {
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
