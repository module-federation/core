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

function inferPkgVersionFromResource(resource: string): string | undefined {
  try {
    const nmIndex = resource.lastIndexOf(NODE_MODULES);
    if (nmIndex === -1) {
      return undefined;
    }
    const after = resource.substring(nmIndex + NODE_MODULES.length + 1);

    // pnpm layout: node_modules/.pnpm/<encoded@version>/node_modules/<pkg>/...
    if (after.startsWith(`${PNPM_STORE}/`)) {
      const encodedPkgWithVersion = after.split(/[\\/]+/)[1];
      if (encodedPkgWithVersion) {
        const encodedPkgWithoutPeers = encodedPkgWithVersion.split('_')[0];
        const versionStart = encodedPkgWithoutPeers.lastIndexOf('@');
        if (versionStart > 0) {
          return encodedPkgWithoutPeers.slice(versionStart + 1);
        }
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

  private resetData() {
    this._collectedEntries = {};
  }

  private getSharedName(request: string) {
    const matchedSharedOption = this.sharedOptions.find(
      ([sharedName, sharedConfig]) =>
        request === sharedName ||
        request === sharedConfig.import ||
        request === sharedConfig.request ||
        request === sharedConfig.shareKey,
    );
    return matchedSharedOption?.[0];
  }

  private addRequest(sharedName: string, resource: string, version: string) {
    this._collectedEntries[sharedName] ||= { requests: [] };
    const requests = this._collectedEntries[sharedName].requests;
    if (requests.some(([, existingVersion]) => existingVersion === version)) {
      return;
    }
    requests.push([resource, version]);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'CollectSharedEntryPlugin',
      (_compilation, { normalModuleFactory }) => {
        this.resetData();
        normalModuleFactory.hooks.module.tap(
          'CollectSharedEntryPlugin',
          (module, { resource }) => {
            if (!resource || !('rawRequest' in module)) {
              return module;
            }
            const sharedName = this.getSharedName(module.rawRequest as string);
            if (!sharedName) {
              return module;
            }
            const sharedVersion = inferPkgVersionFromResource(resource);
            if (!sharedVersion) {
              return module;
            }
            this.addRequest(sharedName, resource, sharedVersion);
            return module;
          },
        );
      },
    );
  }
}

export default CollectSharedEntryPlugin;
