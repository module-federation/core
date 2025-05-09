/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra and Zackary Jackson @ScriptedAlchemy
*/

'use strict';
import {
  getWebpackPath,
  normalizeWebpackPath,
} from '@module-federation/sdk/normalize-webpack-path';
import type {
  Compiler,
  Compilation,
  WebpackError as WebpackErrorType,
} from 'webpack';
import { parseOptions } from '../container/options';
import ProvideForSharedDependency from './ProvideForSharedDependency';
import ProvideSharedDependency from './ProvideSharedDependency';
import ProvideSharedModuleFactory from './ProvideSharedModuleFactory';
import type {
  ProvideSharedPluginOptions,
  ProvidesConfig,
} from '../../declarations/plugins/sharing/ProvideSharedPlugin';
import FederationRuntimePlugin from '../container/runtime/FederationRuntimePlugin';
import { createSchemaValidation } from '../../utils';
import { satisfy } from '@module-federation/runtime-tools/runtime-core';
const WebpackError = require(
  normalizeWebpackPath('webpack/lib/WebpackError'),
) as typeof import('webpack/lib/WebpackError');

export type ResolvedProvideMap = Map<
  string,
  {
    config: ProvidesConfig;
    version: string | undefined | false;
    resource?: string;
  }
>;

const validate = createSchemaValidation(
  //eslint-disable-next-line
  require('../../schemas/sharing/ProvideSharedPlugin.check.js').validate,
  () => require('../../schemas/sharing/ProvideSharedPlugin').default,
  {
    name: 'Provide Shared Plugin',
    baseDataPath: 'options',
  },
);

/**
 * @typedef {Object} ProvideOptions
 * @property {string} shareKey
 * @property {string | string[]} shareScope
 * @property {string | undefined | false} version
 * @property {boolean} eager
 * @property {string} [request] The actual request to use for importing the module
 */

/** @typedef {Map<string, { config: ProvideOptions, version: string | undefined | false }>} ResolvedProvideMap */

// Helper function to create composite key
function createLookupKey(
  request: string,
  config: { layer?: string | null },
): string {
  if (config.layer) {
    return `(${config.layer})${request}`;
  }
  return request;
}

class ProvideSharedPlugin {
  private _provides: [string, ProvidesConfig][];

  /**
   * @param {ProvideSharedPluginOptions} options options
   */
  constructor(options: ProvideSharedPluginOptions) {
    validate(options);

    console.log('[ProvideSharedPlugin] Constructor options:', {
      providesCount: Object.keys(options.provides || {}).length
    });

    this._provides = parseOptions(
      options.provides,
      (item) => {
        if (Array.isArray(item))
          throw new Error('Unexpected array of provides');
        /** @type {ProvidesConfig} */
        const result: ProvidesConfig = {
          shareKey: item,
          version: undefined,
          shareScope: options.shareScope || 'default',
          eager: false,
          requiredVersion: false,
          strictVersion: false,
          singleton: false,
          layer: undefined,
          request: item,
          exclude: undefined,
        };
        return result;
      },
      (item, key) => {
        const request = item.request || key;
        // Debug log in transform function
        console.log(`[ProvideSharedPlugin] Processing provide for ${key}:`, {
          hasInclude: !!item.include,
          includeDetails: item.include,
          request
        });
        return {
          shareScope: item.shareScope || options.shareScope || 'default',
          shareKey: item.shareKey || request,
          version: item.version,
          eager: !!item.eager,
          requiredVersion: item.requiredVersion,
          strictVersion: item.strictVersion,
          singleton: !!item.singleton,
          layer: item.layer,
          request,
          exclude: item.exclude,
          include: item.include,
        };
      },
    );
    this._provides.sort(([a], [b]) => {
      if (a < b) return -1;
      if (b < a) return 1;
      return 0;
    });

    // Debug log after parsing options
    console.log('[ProvideSharedPlugin] Parsed provides:',
      this._provides.map(([key, config]) => ({
        key,
        hasInclude: !!config.include,
        includeDetails: config.include,
        requestFromConfig: config.request
      }))
    );
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler: Compiler): void {
    new FederationRuntimePlugin().apply(compiler);
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    const compilationData: WeakMap<Compilation, ResolvedProvideMap> =
      new WeakMap();

    compiler.hooks.compilation.tap(
      'ProvideSharedPlugin',
      (compilation: Compilation, { normalModuleFactory }) => {
        const resolvedProvideMap: ResolvedProvideMap = new Map();
        const matchProvides: Map<string, ProvidesConfig> = new Map();
        const prefixMatchProvides: Map<string, ProvidesConfig> = new Map();
        for (const [request, config] of this._provides) {
          const actualRequest = config.request || request;
          // Debug log for each provides entry
          console.log(`[ProvideSharedPlugin] Setting up provide for ${request}:`, {
            actualRequest,
            hasInclude: !!config.include,
            includeDetails: config.include,
            isPrefix: actualRequest.endsWith('/')
          });

          const lookupKey = createLookupKey(actualRequest, config);
          if (/^(\/|[A-Za-z]:\\|\\\\|\.\.?(\/|$))/.test(actualRequest)) {
            // relative request
            resolvedProvideMap.set(lookupKey, {
              config,
              version: config.version,
            });
          } else if (/^(\/|[A-Za-z]:\\|\\\\)/.test(actualRequest)) {
            // absolute path
            resolvedProvideMap.set(lookupKey, {
              config,
              version: config.version,
            });
          } else if (actualRequest.endsWith('/')) {
            // module request prefix
            prefixMatchProvides.set(lookupKey, config);
            console.log(`[ProvideSharedPlugin] Added to prefixMatchProvides:`, {
              key: actualRequest,
              hasInclude: !!config.include,
              includeDetails: config.include
            });
          } else {
            // module request
            matchProvides.set(lookupKey, config);
          }
        }

        compilationData.set(compilation, resolvedProvideMap);

        normalModuleFactory.hooks.module.tap(
          'ProvideSharedPlugin',
          (module, { resource, resourceResolveData }, resolveData) => {
            const moduleLayer = module.layer;
            const lookupKey = createLookupKey(resource || '', {
              layer: moduleLayer || undefined,
            });
            console.log(`[ProvideSharedPlugin-DEBUG] Module hook: resource='${resource}', layer='${moduleLayer}', request='${resolveData.request}'`);

            if (resource && resolvedProvideMap.has(lookupKey)) {
              console.log(`[ProvideSharedPlugin-DEBUG] Already resolved: key='${lookupKey}'`);
              return module;
            }
            const { request } = resolveData;
            {
              const requestKey = createLookupKey(request, {
                layer: moduleLayer || undefined,
              });
              const config = matchProvides.get(requestKey);
              if (config !== undefined && resource) {
                console.log(`[ProvideSharedPlugin-DEBUG] Matched in matchProvides: key='${requestKey}'`, { config });
                this.provideSharedModule(
                  compilation,
                  resolvedProvideMap,
                  request,
                  config,
                  resource,
                  resourceResolveData,
                );
                resolveData.cacheable = false;
              }
            }
            for (const [prefix, config] of prefixMatchProvides) {
              const lookup = config.request || prefix;
              if (request.startsWith(lookup) && resource) {
                const remainder = request.slice(lookup.length);
                console.log(`[ProvideSharedPlugin-DEBUG] Checking prefix: '${prefix}' for request: '${request}'`, { remainder, config });

                // First check include if it exists - only proceed if request matches include pattern
                if (
                  config.include &&
                  config.include.request &&
                  !(config.include.request instanceof RegExp
                    ? config.include.request.test(remainder)
                    : remainder === config.include.request)
                ) {
                  console.log(`[ProvideSharedPlugin-DEBUG] Include filter passed for request: '${request}'`);
                  continue; // Skip if include doesn't match
                }

                // Then check exclude if it exists - skip if request matches exclude pattern
                if (
                  config.exclude &&
                  config.exclude.request &&
                  (config.exclude.request instanceof RegExp
                    ? config.exclude.request.test(remainder)
                    : remainder === config.exclude.request)
                ) {
                  console.log(`[ProvideSharedPlugin-DEBUG] Exclude filter passed for request: '${request}'`);
                  continue; // Skip if exclude matches
                }
                console.log(`[ProvideSharedPlugin-DEBUG] Prefix match found: prefix='${prefix}'`, { config, request });
                const finalConfig = {
                  ...config,
                  shareKey: config.shareKey + remainder,
                };
                console.log(`[ProvideSharedPlugin-DEBUG] Calling provideSharedModule with finalConfig:`, { finalConfig });
                this.provideSharedModule(
                  compilation,
                  resolvedProvideMap,
                  resource,
                  finalConfig,
                  resource,
                  resourceResolveData,
                );
                resolveData.cacheable = false;
              }
            }
            return module;
          },
        );
      },
    );
    compiler.hooks.finishMake.tapPromise(
      'ProvideSharedPlugin',
      async (compilation: Compilation) => {
        const resolvedProvideMap = compilationData.get(compilation);
        if (!resolvedProvideMap) return;

        await Promise.all(
          Array.from(
            resolvedProvideMap,
            ([resourceKey, { config, version, resource }]) => {
              return new Promise<void>((resolve, reject) => {
                compilation.addInclude(
                  compiler.context,
                  new ProvideSharedDependency(
                    config.shareScope!,
                    config.shareKey!,
                    version || false,
                    resource || resourceKey,
                    config.eager!,
                    config.requiredVersion!,
                    config.strictVersion!,
                    config.singleton!,
                    config.layer,
                  ),
                  {
                    name: undefined,
                  },
                  (err?: WebpackErrorType | null | undefined) => {
                    if (err) {
                      return reject(err);
                    }
                    resolve();
                  },
                );
              });
            },
          ),
        );
      },
    );

    compiler.hooks.compilation.tap(
      'ProvideSharedPlugin',
      (compilation: Compilation, { normalModuleFactory }) => {
        compilation.dependencyFactories.set(
          ProvideForSharedDependency,
          normalModuleFactory,
        );

        compilation.dependencyFactories.set(
          ProvideSharedDependency,
          new ProvideSharedModuleFactory(),
        );
      },
    );
  }

  private provideSharedModule(
    compilation: Compilation,
    resolvedProvideMap: ResolvedProvideMap,
    key: string,
    config: ProvidesConfig,
    resource: string,
    resourceResolveData: any,
  ): void {
    let version = config.version;
    console.log(`[ProvideSharedPlugin-DEBUG] provideSharedModule called: key='${key}', resource='${resource}'`, { config, initialVersion: version });
    if (version === undefined) {
      let details = '';
      if (!resourceResolveData) {
        details = `No resolve data provided from resolver.`;
      } else {
        const descriptionFileData = resourceResolveData.descriptionFileData;
        if (!descriptionFileData) {
          details =
            'No description file (usually package.json) found. Add description file with name and version, or manually specify version in shared config.';
        } else if (!descriptionFileData.version) {
          details = `No version in description file (usually package.json). Add version to description file ${resourceResolveData.descriptionFilePath}, or manually specify version in shared config.`;
        } else {
          version = descriptionFileData.version;
        }
      }
      if (!version) {
        const error = new WebpackError(
          `No version specified and unable to automatically determine one. ${details}`,
        );
        error.file = `shared module ${key} -> ${resource}`;
        compilation.warnings.push(error);
        console.log(`[ProvideSharedPlugin-DEBUG] Version could not be determined for: '${key}'`);
      } else {
        console.log(`[ProvideSharedPlugin-DEBUG] Determined version for '${key}': '${version}'`);
      }
    }

    // --- Add Include Check ---
    // Check if the determined version should be included based on include.version
    if (
      config.include &&
      typeof config.include.version === 'string' &&
      typeof version === 'string' &&
      version &&
      !satisfy(version, config.include.version)
    ) {
      // Version doesn't match the include range, so skip providing this module version
      console.log(`[ProvideSharedPlugin-DEBUG] Skipping provide (include mismatch): key='${key}', version='${version}', include='${config.include.version}'`);
      return;
    }

    // --- Add Exclude Check ---
    // Check if the determined version should be excluded based on exclude.version
    if (
      config.exclude &&
      typeof config.exclude.version === 'string' &&
      typeof version === 'string' &&
      version &&
      satisfy(version, config.exclude.version)
    ) {
      // Version matches the exclude range, so skip providing this module version
      console.log(`[ProvideSharedPlugin-DEBUG] Skipping provide (exclude match): key='${key}', version='${version}', exclude='${config.exclude.version}'`);
      return;
    }

    // Check if the request matches the exclude.request pattern
    if (
      config.exclude &&
      config.exclude.request &&
      (config.exclude.request instanceof RegExp
        ? config.exclude.request.test(resource)
        : resource === config.exclude.request)
    ) {
      // Request matches the exclude pattern, so skip providing this module
      console.log(`[ProvideSharedPlugin-DEBUG] Skipping provide (exclude request match): key='${key}', resource='${resource}'`, { excludeRequest: config.exclude.request });
      return;
    }
    // --- End Exclude Check ---

    const lookupKey = createLookupKey(resource, config);
    console.log(`[ProvideSharedPlugin-DEBUG] Setting resolved provide: key='${lookupKey}'`, { config, version, resource });
    resolvedProvideMap.set(lookupKey, {
      config,
      version,
      resource,
    });
  }
}
export default ProvideSharedPlugin;
