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

const NODE_MODULES = 'node_modules';
const PNPM_STORE = '.pnpm';

const getPackageNameFromRequest = (request: string): string => {
  const parts = request.split('/').filter(Boolean);
  if (!parts.length) {
    return request;
  }
  if (parts[0].startsWith('@') && parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return parts[0];
};

const getPackagePathParts = (packageName: string): string[] =>
  packageName.split('/').filter(Boolean);

const findNodeModulesDirs = (startContext: string): string[] => {
  const dirs: string[] = [];
  let current = path.resolve(startContext);
  const root = path.parse(current).root;

  while (true) {
    const nodeModulesPath = path.join(current, NODE_MODULES);
    if (fs.existsSync(nodeModulesPath)) {
      dirs.push(nodeModulesPath);
    }
    if (current === root) {
      break;
    }
    current = path.dirname(current);
  }

  return dirs;
};

const addShareRequest = (
  collectedEntries: ShareRequestsMap,
  sharedName: string,
  request: string,
  version: string,
) => {
  collectedEntries[sharedName] ||= { requests: [] };
  const requests = collectedEntries[sharedName].requests;
  if (
    requests.some(
      ([existingRequest, existingVersion]) =>
        existingRequest === request && existingVersion === version,
    )
  ) {
    return;
  }
  requests.push([request, version]);
};

function inferPkgVersionFromResource(resource: string): string | undefined {
  try {
    const nmIndex = resource.lastIndexOf(NODE_MODULES);
    if (nmIndex === -1) {
      return undefined;
    }
    const after = resource.substring(nmIndex + NODE_MODULES.length + 1);

    // pnpm layout: node_modules/.pnpm/<encoded@version>/node_modules/<pkg>/...
    if (after.startsWith(`${PNPM_STORE}/`)) {
      const m = after.match(
        new RegExp(`\\${PNPM_STORE}/(?:[^/]+)@([^/]+)/${NODE_MODULES}/`),
      );
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
    const nmBase = resource.substring(0, nmIndex + NODE_MODULES.length + 1);
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

const readPackageVersion = (packageJsonPath: string): string | undefined => {
  try {
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(content);
    return typeof pkg?.version === 'string' && pkg.version
      ? pkg.version
      : undefined;
  } catch {
    return undefined;
  }
};

export function collectInstalledSharedPackageVersions(
  context: string,
  sharedOptions: NormalizedSharedOptions,
): ShareRequestsMap {
  const collectedEntries: ShareRequestsMap = {};

  for (const [sharedName, sharedConfig] of sharedOptions) {
    const importRequest =
      typeof sharedConfig.import === 'string'
        ? sharedConfig.import
        : sharedConfig.packageName || sharedName;
    const packageName = getPackageNameFromRequest(
      sharedConfig.packageName || importRequest,
    );
    const packagePathParts = getPackagePathParts(packageName);

    for (const nodeModulesPath of findNodeModulesDirs(context)) {
      const directPackageJson = path.join(
        nodeModulesPath,
        ...packagePathParts,
        'package.json',
      );
      const directVersion = readPackageVersion(directPackageJson);
      if (directVersion) {
        addShareRequest(
          collectedEntries,
          sharedName,
          path.dirname(directPackageJson),
          directVersion,
        );
      }

      const pnpmStorePath = path.join(nodeModulesPath, PNPM_STORE);
      if (!fs.existsSync(pnpmStorePath)) {
        continue;
      }

      let storeEntries: string[];
      try {
        storeEntries = fs.readdirSync(pnpmStorePath);
      } catch {
        continue;
      }

      for (const storeEntry of storeEntries) {
        const packageJsonPath = path.join(
          pnpmStorePath,
          storeEntry,
          NODE_MODULES,
          ...packagePathParts,
          'package.json',
        );
        const version = readPackageVersion(packageJsonPath);
        if (!version) {
          continue;
        }
        addShareRequest(
          collectedEntries,
          sharedName,
          path.dirname(packageJsonPath),
          version,
        );
      }
    }
  }

  return collectedEntries;
}

export function mergeShareRequestsMap(
  target: ShareRequestsMap,
  source: ShareRequestsMap,
): ShareRequestsMap {
  Object.entries(source).forEach(([sharedName, { requests }]) => {
    requests.forEach(([request, version]) => {
      addShareRequest(target, sharedName, request, version);
    });
  });
  return target;
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
        normalModuleFactory.hooks.module.tap(
          'CollectSharedEntryPlugin',
          (module, { resource }) => {
            if (!resource || !('rawRequest' in module)) {
              return module;
            }
            const matchedSharedOption = sharedOptions.find(
              (item) => item[0] === (module.rawRequest as string),
            );
            if (!matchedSharedOption) {
              return module;
            }
            const [sharedName] = matchedSharedOption;
            const sharedVersion = inferPkgVersionFromResource(resource);
            if (!sharedVersion) {
              return module;
            }
            addShareRequest(
              collectedEntries,
              sharedName,
              resource,
              sharedVersion,
            );
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
