import type { Compiler } from 'webpack';
import * as fs from 'fs';
import * as path from 'path';
import { NormalizedSharedOptions } from '../SharePlugin';

const PLUGIN_NAME = 'CollectSharedEntryPlugin';

export type ShareRequestsMap = Record<
  string,
  {
    // request, version
    requests: [string, string][];
  }
>;

export type CollectSharedEntryPluginOptions = {
  sharedOptions: NormalizedSharedOptions;
  shareScope?: string;
};

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
        if (!normalModuleFactory?.hooks?.module) {
          return;
        }
        normalModuleFactory.hooks.module.tap(
          'CollectSharedEntryPlugin',
          (module, { resource }, resolveData) => {
            if (!resource || !('rawRequest' in module)) {
              return module;
            }
            const matchedSharedOption = sharedOptions.find(
              (item) => item[0] === (module.rawRequest as string),
            );
            if (!matchedSharedOption) {
              return module;
            }
            const [sharedName, _] = matchedSharedOption;
            const sharedVersion = inferPkgVersionFromResource(resource);
            if (!sharedVersion) {
              return module;
            }
            const request =
              typeof module.rawRequest === 'string' && module.rawRequest
                ? module.rawRequest
                : resource;
            collectedEntries[sharedName] ||= { requests: [] };
            collectedEntries[sharedName].requests.push([
              request,
              sharedVersion,
            ]);
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
