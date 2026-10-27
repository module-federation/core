import type { Compiler } from 'webpack';
import * as fs from 'fs';
import * as path from 'path';
import { NormalizedSharedOptions } from '../SharePlugin';

const PLUGIN_NAME = 'CollectSharedEntryPlugin';

export type ShareRequestsMap = Record<
  string,
  {
    requests: [resource: string, version: string, optionIndex?: number][];
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

  private addRequest(
    sharedName: string,
    resource: string,
    version: string,
    optionIndex: number,
  ) {
    this._collectedEntries[sharedName] ||= { requests: [] };
    const requests = this._collectedEntries[sharedName].requests;
    if (
      requests.some(
        ([existingResource, existingVersion, existingIndex]) =>
          existingResource === resource &&
          existingVersion === version &&
          existingIndex === optionIndex,
      )
    ) {
      return;
    }
    requests.push([resource, version, optionIndex]);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'CollectSharedEntryPlugin',
      (compilation) => {
        compilation.hooks.finishModules.tap(
          'CollectSharedEntryPlugin',
          (modules) => {
            this.resetData();
            for (const module of modules) {
              if (
                !('resource' in module) ||
                typeof module.resource !== 'string' ||
                !('rawRequest' in module)
              )
                continue;
              const resource = module.resource;
              this.sharedOptions.forEach(
                ([sharedName, sharedConfig], optionIndex) => {
                  const request = module.rawRequest;
                  if (
                    sharedConfig.import === false ||
                    (module.layer ?? undefined) !== sharedConfig.layer ||
                    ![
                      sharedName,
                      sharedConfig.import,
                      sharedConfig.request,
                      sharedConfig.shareKey,
                    ].includes(request as string)
                  ) {
                    return;
                  }
                  const configuredVersion =
                    typeof sharedConfig.version === 'string'
                      ? sharedConfig.version
                      : undefined;
                  const sharedVersion =
                    configuredVersion || inferPkgVersionFromResource(resource);
                  if (sharedVersion)
                    this.addRequest(
                      sharedName,
                      resource,
                      sharedVersion,
                      optionIndex,
                    );
                },
              );
            }
          },
        );
      },
    );
  }
}

export default CollectSharedEntryPlugin;
