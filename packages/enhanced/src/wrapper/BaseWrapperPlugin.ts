import type { WebpackPluginInstance, Compiler } from 'webpack';
import { getWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import path from 'node:path';

/**
 * Base Wrapper Plugin Class
 *
 * Why we need a Wrapper layer:
 * 1. Prevent direct references to peer dependency webpack in CommonJS environment, which can lead to inconsistent instances
 * 2. Ensure the FEDERATION_WEBPACK_PATH environment variable is set correctly, which is crucial for module federation to work properly
 * 3. Provide unified plugin initialization logic, reducing code duplication
 *
 * Why we need to set FEDERATION_WEBPACK_PATH:
 * In CommonJS environment, require('webpack') might get a different webpack version than the current compiler instance,
 * which can cause module federation to malfunction. By setting FEDERATION_WEBPACK_PATH, we ensure all internal
 * dependencies use the same webpack instance as the current compiler.
 */
export default abstract class BaseWrapperPlugin
  implements WebpackPluginInstance
{
  protected _options: any;
  name: string;
  protected pluginName: string;
  protected coreModulePath: string;

  constructor(options: any, pluginName: string, coreModulePath: string) {
    this._options = options;
    this.pluginName = pluginName;
    this.coreModulePath = coreModulePath;
    this.name = pluginName;
  }

  apply(compiler: Compiler): void {
    // Ensure FEDERATION_WEBPACK_PATH environment variable is set correctly
    process.env['FEDERATION_WEBPACK_PATH'] =
      process.env['FEDERATION_WEBPACK_PATH'] || getWebpackPath(compiler);

    let resolvedCoreModulePath = this.coreModulePath;

    if (this.coreModulePath.startsWith('.')) {
      const absoluteCoreModulePath = path.resolve(
        __dirname,
        this.coreModulePath,
      );
      const distCoreModulePath = path.resolve(
        __dirname,
        '../../dist/src',
        this.coreModulePath.replace(/^\.\.\//, ''),
      );

      const candidates = [
        absoluteCoreModulePath,
        `${absoluteCoreModulePath}.js`,
        `${absoluteCoreModulePath}.cjs`,
        `${absoluteCoreModulePath}.mjs`,
        distCoreModulePath,
        `${distCoreModulePath}.js`,
        `${distCoreModulePath}.cjs`,
        `${distCoreModulePath}.mjs`,
      ];

      for (const candidate of candidates) {
        try {
          resolvedCoreModulePath = require.resolve(candidate);
          break;
        } catch {
          // continue to the next candidate
        }
      }
    }

    const CorePlugin = require(resolvedCoreModulePath).default as any;

    // Create core plugin instance and apply it
    this.createCorePluginInstance(CorePlugin, compiler);
  }

  /**
   * Create core plugin instance
   * Subclasses can override this method to customize instantiation logic
   */
  protected createCorePluginInstance(
    CorePlugin: any,
    compiler: Compiler,
  ): void {
    new CorePlugin(this._options).apply(compiler);
  }
}
