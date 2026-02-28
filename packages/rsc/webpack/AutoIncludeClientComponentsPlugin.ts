import type { Compilation, Compiler } from 'webpack';
import { createRequire } from 'module';
import { getCachedClientManifest } from './rscBuildContext';

const nodeRequire = createRequire(import.meta.url);
const { getWebpackPath, normalizeWebpackPath } = nodeRequire(
  '@module-federation/sdk/normalize-webpack-path',
);

type AutoIncludeClientComponentsPluginOptions = {
  entryName?: string;
  manifestFilename?: string;
};

export default class AutoIncludeClientComponentsPlugin {
  entryName: string;
  manifestFilename: string;

  constructor(options: AutoIncludeClientComponentsPluginOptions = {}) {
    this.entryName = options.entryName || 'ssr';
    this.manifestFilename =
      options.manifestFilename || 'react-client-manifest.json';
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

    const { Compilation: WebpackCompilation } = compiler.webpack;

    compiler.hooks.thisCompilation.tap(
      'AutoIncludeClientComponentsPlugin',
      (compilation: Compilation) => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: 'AutoIncludeClientComponentsPlugin',
            stage:
              WebpackCompilation.PROCESS_ASSETS_STAGE_OPTIMIZE_TRANSFER - 1,
          },
          async () => {
            const { getEntryRuntime } = nodeRequire(
              normalizeWebpackPath('webpack/lib/util/runtime'),
            ) as typeof import('webpack/lib/util/runtime');

            let clientManifest: Record<string, unknown> | null = null;

            const clientManifestAsset = compilation.getAsset(
              this.manifestFilename,
            );
            if (clientManifestAsset) {
              try {
                clientManifest = JSON.parse(
                  clientManifestAsset.source.source().toString(),
                );
              } catch (_e) {
                /* ignore */
              }
            }

            if (!clientManifest) {
              const ssrManifestAsset = compilation.getAsset(
                'react-ssr-manifest.json',
              );
              if (ssrManifestAsset) {
                try {
                  clientManifest = JSON.parse(
                    ssrManifestAsset.source.source().toString(),
                  );
                } catch (_e) {
                  /* ignore */
                }
              }
            }

            if (!clientManifest) {
              const outputPath = compiler.options.output?.path || '';
              clientManifest = getCachedClientManifest(
                outputPath,
                this.manifestFilename,
              );
            }

            if (!clientManifest) return;

            const entries = Object.values(clientManifest);
            if (!entries.length) return;

            const runtime = getEntryRuntime(compilation, this.entryName);

            const moduleIds = new Set(
              entries
                .map((entry) => this.getStringProp(entry, 'id'))
                .filter((id): id is string => !!id),
            );

            if (!moduleIds.size) return;

            for (const mod of compilation.modules) {
              const moduleId =
                compilation.chunkGraph.getModuleId(mod) ??
                (mod as any).resource;
              if (!moduleId) continue;

              const idStr = String(moduleId);
              const matched =
                moduleIds.has(idStr) ||
                moduleIds.has(`./${idStr}`) ||
                moduleIds.has(idStr.replace(/^\(client\)\//, ''));

              if (matched) {
                try {
                  compilation.moduleGraph
                    .getExportsInfo(mod)
                    .setUsedInUnknownWay(runtime);
                } catch (_e) {
                  // best effort
                }
              }
            }
          },
        );
      },
    );
  }
}
