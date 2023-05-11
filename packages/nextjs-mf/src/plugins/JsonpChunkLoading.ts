// CustomWebpackPlugin.ts
import type {
  Chunk,
  Compilation,
  Compiler,
  Module,
  RuntimeModule,
} from 'webpack';
import { ConcatSource } from 'webpack-sources';
// @ts-ignore
import JsonpChunkLoadingRuntimeModule from 'webpack/lib/web/JsonpChunkLoadingRuntimeModule';
import Template from '../../utils/Template';
import { DEFAULT_SHARE_SCOPE_BROWSER } from '../internal';
// import { loadDependenciesTemplate } from './LoadDependenciesTemplate';
import template from './container/custom-jsonp';

function getCustomJsonpCode(
  chunkLoadingGlobal: string,
  RuntimeGlobals: any
): string {
  const code = [
    'var chunkQueue = [];',
    'var resport = [];',
    `var chunkLoadingGlobal = self[${JSON.stringify(
      chunkLoadingGlobal
    )}] || [];`,
    'var asyncQueue = [];',
    template,
  ];
  return Template.asString(code);
}

class CustomWebpackPlugin {
  private initialModules: Set<any>;
  private initialModulesResolved: Map<any, any>;
  private options: any;

  constructor(options?: any) {
    this.options = options || {};
    // eager imports of shared modules
    this.initialModules = new Set();
    this.initialModulesResolved = new Map();
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'CustomWebpackPlugin',
      (compilation: Compilation) => {
        const addModules = (modules: Iterable<Module>): void => {
          for (const module of modules) {
            this.initialModules.add(module);
          }
        };

        compilation.hooks.optimizeChunks.tap(
          'AddModulesToRuntimeChunkPlugin',
          (chunks) => {
            for (const entrypointModule of compilation.entrypoints.values()) {
              const entrypoint = entrypointModule.getEntrypointChunk();
              if (entrypoint.hasRuntime()) continue;

              const processChunks = (
                chunks: Set<Chunk>,
                callback: (modules: Iterable<Module>) => void
              ): void => {
                for (const chunk of chunks) {
                  const modules =
                    compilation.chunkGraph.getChunkModulesIterableBySourceType(
                      chunk,
                      'consume-shared'
                    );

                  if (modules) callback(modules);
                }
              };

              processChunks(entrypoint.getAllAsyncChunks(), addModules);
              processChunks(entrypoint.getAllInitialChunks(), addModules);
            }

            for (const chunk of chunks) {
              const modules =
                compilation.chunkGraph.getChunkModulesIterable(chunk);
              // just use module type provide-module to find shared modules.
              for (const m of modules) {
                const foundTrueShare = Array.from(this.initialModules).some(
                  //@ts-ignore
                  (mod) => mod?.options?.importResolved === m?.resource
                );
                if (foundTrueShare) {
                  this.initialModulesResolved.set(
                    //@ts-ignore
                    m.resource,
                    //@ts-ignore
                    m?.resourceResolveData?.descriptionFileData
                  );
                }
              }
            }
          }
        );

        compilation.hooks.runtimeModule.tap(
          'CustomWebpackPlugin',
          (runtimeModule: RuntimeModule, chunk: any) => {
            if (this.options.server && chunk.name === 'webpack-runtime') {
              // if server runtime module
            }

            if (
              runtimeModule.constructor.name ===
                'JsonpChunkLoadingRuntimeModule' &&
              chunk.name === 'webpack'
            ) {
              const originalSource = runtimeModule.getGeneratedCode();
              const modifiedSource = new ConcatSource(
                originalSource,
                '\n',
                getCustomJsonpCode(
                  //@ts-ignore
                  compilation.outputOptions.chunkLoadingGlobal,
                  compiler.webpack.RuntimeGlobals
                )
              );
              runtimeModule.getGeneratedCode = () => modifiedSource.source();
            }
          }
        );
      }
    );
  }
}

export default CustomWebpackPlugin;
