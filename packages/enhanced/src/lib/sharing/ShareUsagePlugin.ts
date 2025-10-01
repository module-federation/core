/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra, Zackary Jackson @ScriptedAlchemy
*/

'use strict';

import type { Compiler, Compilation } from 'webpack';
import { createSchemaValidation } from '../../utils';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import fs from 'fs';
import path from 'path';
import type { ShareUsagePluginOptions } from '../../declarations/plugins/sharing/ShareUsagePlugin';

/**
 * Plugin to track and report usage of shared modules
 */
class ShareUsagePlugin {
  private _shareScope: string | string[];
  private _outputFile: string;
  private _includeDetails: boolean;
  private _includeUnused: boolean;

  constructor(options: ShareUsagePluginOptions = {}) {
    // Validate schema - commenting out as we don't have a schema yet
    // validate(options);

    this._shareScope = options.shareScope || 'default';
    this._outputFile = options.outputFile || 'share-usage.json';
    this._includeDetails = options.includeDetails !== false;
    this._includeUnused = options.includeUnused !== false;
  }

  /**
   * Applies the plugin to the webpack compiler instance
   * @param compiler - The webpack compiler instance
   */
  apply(compiler: Compiler): void {
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    const outputFile = path.resolve(compiler.outputPath, this._outputFile);
    const pluginName = 'ShareUsagePlugin';

    // Keep track of used shared modules
    const usedSharedModules = new Map<
      string,
      {
        moduleName: string;
        version?: string;
        requiredVersion?: string;
        count: number;
        usedFrom: Set<string>;
      }
    >();

    // Hook into the compilation process
    compiler.hooks.compilation.tap(pluginName, (compilation: Compilation) => {
      // Handle module creation to track usage of shared modules
      compilation.hooks.buildModule.tap(pluginName, (module: any) => {
        // Check if this is a shared module
        if (
          module.constructor &&
          module.constructor.name === 'ConsumeSharedModule'
        ) {
          const shareInfo = module.options || {};
          const shareKey = shareInfo.shareKey || '';

          if (!usedSharedModules.has(shareKey)) {
            usedSharedModules.set(shareKey, {
              moduleName: shareInfo.import || shareKey,
              version: shareInfo.version || undefined,
              requiredVersion: shareInfo.requiredVersion || undefined,
              count: 1,
              usedFrom: new Set(),
            });
          } else {
            const info = usedSharedModules.get(shareKey)!;
            info.count++;
          }

          // Add the issuer to the usage information
          if (module.issuer && module.issuer.resource) {
            const issuerResource = module.issuer.resource.replace(
              compiler.context,
              '',
            );
            usedSharedModules.get(shareKey)!.usedFrom.add(issuerResource);
          }
        }
      });
    });

    // Generate the report at the end of compilation
    compiler.hooks.afterEmit.tapAsync(pluginName, (compilation, callback) => {
      try {
        // Get all shared modules from the compiler
        const allSharedModules = new Set<string>();

        // Look for all shareScope entries in the compilation
        if (compilation.chunkGraph) {
          const modulesIterable = compilation.modules || [];
          for (const module of modulesIterable) {
            if (
              module.constructor &&
              (module.constructor.name === 'ProvideSharedModule' ||
                module.constructor.name === 'ConsumeSharedModule')
            ) {
              const shareInfo = (module as any).options || {};
              const shareKey = shareInfo.shareKey || '';
              if (shareKey) {
                allSharedModules.add(shareKey);
              }
            }
          }
        }

        // Prepare report data
        const report = {
          timestamp: new Date().toISOString(),
          outputPath: compiler.outputPath,
          sharedModules: Object.fromEntries(
            Array.from(usedSharedModules.entries()).map(([key, info]) => [
              key,
              {
                moduleName: info.moduleName,
                version: info.version,
                requiredVersion: info.requiredVersion,
                usageCount: info.count,
                usedFrom: this._includeDetails
                  ? Array.from(info.usedFrom)
                  : undefined,
              },
            ]),
          ),
          unusedSharedModules: this._includeUnused
            ? Array.from(allSharedModules).filter(
                (mod) => !usedSharedModules.has(mod),
              )
            : undefined,
        };

        // Ensure output directory exists
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write report to file
        fs.writeFileSync(outputFile, JSON.stringify(report, null, 2), 'utf8');

        compilation.assets[this._outputFile] =
          new (require('webpack').sources.RawSource)(
            JSON.stringify(report, null, 2),
          );

        console.log(`[ShareUsagePlugin] Usage report written to ${outputFile}`);
      } catch (err) {
        compilation.errors.push(
          new (require('webpack').WebpackError)(
            `[ShareUsagePlugin] Failed to generate usage report: ${err}`,
          ),
        );
      }

      callback();
    });
  }
}

export default ShareUsagePlugin;
