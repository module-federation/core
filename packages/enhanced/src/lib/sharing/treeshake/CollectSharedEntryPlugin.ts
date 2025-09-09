import type { moduleFederationPlugin } from '@module-federation/sdk';

import type { Compiler } from 'webpack';

const PLUGIN_NAME = 'CollectSharedEntryPlugin';
export type ResolvedProvideMap = Map<
  string,
  {
    resource: string;
  }
>;

function extractPathAfterNodeModules(filePath: string): string | null {
  // Fast check for 'node_modules' substring
  if (~filePath.indexOf('node_modules')) {
    const nodeModulesIndex = filePath.lastIndexOf('node_modules');
    const result = filePath.substring(nodeModulesIndex + 13); // 13 = 'node_modules/'.length
    return result;
  }
  return null;
}

class CollectSharedEntryPlugin {
  _options: {
    shared: string[];
  };
  resolvedProvideMap: ResolvedProvideMap;
  name: string;

  constructor(options: moduleFederationPlugin.ModuleFederationPluginOptions) {
    this.name = PLUGIN_NAME;

    this._options = {
      shared: Object.keys(options.shared || {}),
    };
    this.resolvedProvideMap = new Map();
  }

  getData() {
    return this.resolvedProvideMap;
  }

  apply(compiler: Compiler): void {
    const { shared } = this._options;
    const { resolvedProvideMap } = this;
    compiler.hooks.compilation.tap(
      'CollectSharedEntryPlugin',
      (compilation, { normalModuleFactory }) => {
        const matchProvides = new Map();
        const prefixMatchProvides = new Map();
        for (const sharedName of shared) {
          const actualRequest = sharedName;
          const lookupKey = actualRequest;
          if (/^(\/|[A-Za-z]:\\|\\\\|\.\.?(\/|$))/.test(actualRequest)) {
            // relative request - apply filtering if include/exclude are defined
            resolvedProvideMap.set(lookupKey, {
              resource: actualRequest,
            });
          } else if (/^(\/|[A-Za-z]:\\|\\\\)/.test(actualRequest)) {
            // absolute path - apply filtering if include/exclude are defined
            resolvedProvideMap.set(lookupKey, {
              resource: actualRequest,
            });
          } else if (actualRequest.endsWith('/')) {
            prefixMatchProvides.set(lookupKey, actualRequest);
          } else {
            matchProvides.set(lookupKey, actualRequest);
          }
        }
        normalModuleFactory.hooks.module.tap(
          'CollectSharedEntryPlugin',
          (module, { resource, resourceResolveData }, resolveData) => {
            if (resource && resolvedProvideMap.has(resource)) {
              return module;
            }
            const { request: originalRequestString } = resolveData;
            // --- Stage 1a: Direct match with originalRequestString ---
            const originalRequestLookupKey = originalRequestString;
            const configFromOriginalDirect = matchProvides.get(
              originalRequestLookupKey,
            );
            if (
              configFromOriginalDirect !== undefined &&
              resource &&
              !resolvedProvideMap.has(resource)
            ) {
              // Apply request filters if defined (from PR5's cleaner approach)
              resolvedProvideMap.set(originalRequestString, {
                resource,
              });
              resolveData.cacheable = false;
            }
            // --- Stage 1b: Prefix match with originalRequestString ---
            if (resource && !resolvedProvideMap.has(resource)) {
              // no handle prefix shared yet
            }
            // --- Stage 2: Match using reconstructed node_modules path ---
            if (resource && !resolvedProvideMap.has(resource)) {
              const modulePathAfterNodeModules =
                extractPathAfterNodeModules(resource);
              if (modulePathAfterNodeModules) {
                // 2a. Direct match with reconstructed path
                const reconstructedLookupKey = modulePathAfterNodeModules;
                const configFromReconstructedDirect = matchProvides.get(
                  reconstructedLookupKey,
                );
                if (
                  configFromReconstructedDirect?.nodeModulesReconstructedLookup &&
                  !resolvedProvideMap.has(resource)
                ) {
                  resolvedProvideMap.set(modulePathAfterNodeModules, {
                    resource,
                  });
                  resolveData.cacheable = false;
                }
                // 2b. Prefix match with reconstructed path
                if (resource && !resolvedProvideMap.has(resource)) {
                  // no handle prefix shared
                }
              }
            }
            return module;
          },
        );
      },
    );
  }
}

export default CollectSharedEntryPlugin;
