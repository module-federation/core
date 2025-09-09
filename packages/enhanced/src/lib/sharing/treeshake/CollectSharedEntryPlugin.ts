import type { Compiler } from 'webpack';
import * as fs from 'fs';
import * as path from 'path';
import { NormalizedSharedOptions } from '../SharePlugin';

const PLUGIN_NAME = 'CollectSharedEntryPlugin';

export type ShareRequestsMap = Record<
  string,
  {
    requests: [string, string][];
  }
>;

export type CollectSharedEntryPluginOptions = {
  sharedOptions: NormalizedSharedOptions;
  shareScope?: string;
};

function extractPathAfterNodeModules(filePath: string): string | null {
  // Fast check for 'node_modules' substring
  if (~filePath.indexOf('node_modules')) {
    const nodeModulesIndex = filePath.lastIndexOf('node_modules');
    const result = filePath.substring(nodeModulesIndex + 13); // 13 = 'node_modules/'.length
    return result;
  }
  return null;
}

function inferPkgVersionFromResource(resource: string): string | undefined {
  try {
    const nmIndex = resource.lastIndexOf('node_modules');
    if (nmIndex === -1) {
      return undefined;
    }
    const after = resource.substring(nmIndex + 'node_modules'.length + 1);

    // pnpm layout: node_modules/.pnpm/<encoded@version>/node_modules/<pkg>/...
    if (after.startsWith('.pnpm/')) {
      const m = after.match(/\.pnpm\/(?:[^/]+)@([^/]+)\/node_modules\//);
      if (m && m[1]) {
        return m[1];
      }
    }

    const parts = after.split(/[\\/]+/).filter(Boolean);
    if (!parts.length) {
      return undefined;
    }
    let pkgPathParts: string[];
    if (parts[0].startsWith('@') && parts.length >= 2) {
      pkgPathParts = [parts[0], parts[1]];
    } else {
      pkgPathParts = [parts[0]];
    }
    const nmBase = resource.substring(0, nmIndex + 'node_modules'.length + 1);
    const pkgJsonPath = path.join(nmBase, ...pkgPathParts, 'package.json');
    try {
      const content = fs.readFileSync(pkgJsonPath, 'utf-8');
      const pkg = JSON.parse(content);
      const v = pkg?.version;
      if (typeof v === 'string' && v) {
        return v;
      }
    } catch {
      // ignore
    }
    return undefined;
  } catch {
    return undefined;
  }
}

class CollectSharedEntryPlugin {
  name = PLUGIN_NAME;

  sharedOptions: NormalizedSharedOptions;
  private _collectedEntries: ShareRequestsMap;

  constructor(options: CollectSharedEntryPluginOptions) {
    this.name = PLUGIN_NAME;

    const { sharedOptions } = options;

    this.sharedOptions = sharedOptions;
    this._collectedEntries = {};
  }

  getData() {
    return this._collectedEntries;
  }

  apply(compiler: Compiler): void {
    const { sharedOptions } = this;
    const { _collectedEntries: collectedEntries } = this;
    compiler.hooks.compilation.tap(
      'CollectSharedEntryPlugin',
      (_compilation, { normalModuleFactory }) => {
        const matchProvides = new Map();

        normalModuleFactory.hooks.module.tap(
          'CollectSharedEntryPlugin',
          (module, { resource }, resolveData) => {
            if (
              !resource ||
              !sharedOptions.find((item) => item[0] === (resource as string))
            ) {
              return module;
            }

            const { request: originalRequestString } = resolveData;
            const modulePathAfterNodeModules =
              extractPathAfterNodeModules(resource);
            if (modulePathAfterNodeModules) {
              // 2a. Direct match with reconstructed path
              const reconstructedLookupKey = modulePathAfterNodeModules;
              const configFromReconstructedDirect = matchProvides.get(
                reconstructedLookupKey,
              );
              if (
                configFromReconstructedDirect?.nodeModulesReconstructedLookup
              ) {
                const entry = (collectedEntries[resource] ||= { requests: [] });
                const version = inferPkgVersionFromResource(resource);
                if (!version) {
                  throw new Error(
                    `Cannot infer version from resource ${resource}`,
                  );
                }
                const exists = entry.requests.some(
                  ([req, ver]) =>
                    req === originalRequestString && ver === version,
                );
                if (!exists) {
                  entry.requests.push([originalRequestString, version]);
                }
                resolveData.cacheable = false;
              }
            }
            return module;
          },
        );
      },
    );

    compiler.hooks.thisCompilation.tap(
      'Collect shared entry',
      (compilation) => {
        compilation.hooks.processAssets.tapPromise(
          {
            name: 'CollectSharedEntry',
            stage:
              compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
          },
          async () => {
            compilation.getAssets().forEach((asset) => {
              compilation.deleteAsset(asset.name);
            });
          },
        );
      },
    );
  }
}

export default CollectSharedEntryPlugin;
