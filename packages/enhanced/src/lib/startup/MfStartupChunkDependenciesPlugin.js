'use strict';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const { RuntimeGlobals } = require(normalizeWebpackPath('webpack'));

const StartupChunkDependenciesRuntimeModule = require(
  normalizeWebpackPath(
    'webpack/lib/runtime/StartupChunkDependenciesRuntimeModule',
  ),
);
const StartupEntrypointRuntimeModule = require(
  normalizeWebpackPath('webpack/lib/runtime/StartupEntrypointRuntimeModule'),
);
const { ConcatSource } = require('webpack-sources');

/** @typedef {import("webpack/declarations/WebpackOptions").ChunkLoadingType} ChunkLoadingType */
/** @typedef {import("webpack/lib/Chunk")} Chunk */
/** @typedef {import("webpack/lib/Compiler")} Compiler */
/** @typedef {import("webpanextjsck/lib/optimize/ConcatenatedModule")} ConcatenatedModule */

/**
 * @typedef {object} Options
 * @property {ChunkLoadingType} chunkLoading
 * @property {boolean=} asyncChunkLoading
 */

class StartupChunkDependenciesPlugin {
  /**
   * @param {Options} options options
   */
  constructor(options) {
    this.asyncChunkLoading = options.asyncChunkLoading || true;
  }

  /**
   * Apply the plugin
   * @param {Compiler} compiler the compiler instance
   * @returns {void}
   */
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      'MfStartupChunkDependenciesPlugin',
      (compilation) => {
        /**
         * @param {Chunk} chunk chunk to check
         * @returns {boolean} true, when the plugin is enabled for the chunk
         */
        const isEnabledForChunk = (chunk) => {
          const chunkGraph = compilation.chunkGraph;
          const entryModules = Array.from(
            chunkGraph.getChunkEntryModulesIterable(chunk),
          );
          return !entryModules.some(
            (entryModule) =>
              entryModule.constructor.name === 'ContainerEntryModule',
          );
        };

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'MfStartupChunkDependenciesPlugin',
          (chunk, set) => {
            if (!chunk.hasRuntime()) return;
            if (!isEnabledForChunk(chunk)) return;

            const hasRemoteScope = set.has(
              RuntimeGlobals.currentRemoteGetScope,
            );
            const hasSharingInit = set.has(RuntimeGlobals.initializeSharing);
            const hasShareMap = set.has(RuntimeGlobals.shareScopeMap);

            if (!hasRemoteScope && !hasSharingInit && !hasShareMap) {
              return;
            }

            set.add(RuntimeGlobals.startup);
            set.add(RuntimeGlobals.ensureChunk);
            set.add(RuntimeGlobals.ensureChunkIncludeEntries);
            compilation.addRuntimeModule(
              chunk,
              new StartupChunkDependenciesRuntimeModule(
                this.asyncChunkLoading,
                true,
              ),
            );
          },
        );

        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'MfStartupChunkDependenciesPlugin',
          (chunk, set) => {
            if (chunk.hasRuntime()) return;
            set.add(RuntimeGlobals.startup);
            set.add('federation-entry-startup');
            set.add(RuntimeGlobals.startupEntrypoint);
          },
        );

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.startupEntrypoint)
          .tap('MfStartupChunkDependenciesPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) return;
            set.add(RuntimeGlobals.require);
            set.add(RuntimeGlobals.ensureChunk);
            set.add(RuntimeGlobals.ensureChunkIncludeEntries);
            compilation.addRuntimeModule(
              chunk,
              new StartupEntrypointRuntimeModule(this.asyncChunkLoading),
            );
          });

        const hooks =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation,
          );

        hooks.renderStartup.tap(
          'MfStartupChunkDependenciesPlugin',
          (startupSource, lastInlinedModule, renderContext) => {
            const { chunk, chunkGraph } = renderContext;

            if (!isEnabledForChunk(chunk)) {
              return startupSource;
            }

            let federationRuntimeModule = null;
            for (const module of chunkGraph.getChunkEntryModulesIterable(
              chunk,
            )) {
              if (module.context && module.context.endsWith('.federation')) {
                federationRuntimeModule = module;
                break;
              }

              if (module && 'modules' in module) {
                for (const concatModule of /** @type {ConcatenatedModule} */ (
                  module
                ).modules) {
                  if (
                    concatModule.context &&
                    concatModule.context.endsWith('.federation')
                  ) {
                    federationRuntimeModule = module;
                    break;
                  }
                }
              }
            }

            if (!federationRuntimeModule) {
              return startupSource;
            }

            return new ConcatSource(
              `${RuntimeGlobals.require}(${JSON.stringify(
                chunkGraph.getModuleId(federationRuntimeModule),
              )});\n`,
              startupSource,
            );
          },
        );
      },
    );
  }
}

export default StartupChunkDependenciesPlugin;
