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
  appName: string,
  RuntimeGlobals: any,
  initialModules: Iterable<Module>,
  initialModulesResolved: Map<any, any>
): string {
  const moduleMaps = new Map();
  for (const module of initialModules) {
    //@ts-ignore
    const importResolved = module?.options?.importResolved;
    const version = initialModulesResolved.get(importResolved)?.version;
    //@ts-ignore
    const shareKey = module?.options?.shareKey;
    if (importResolved && version && shareKey && !moduleMaps.has(shareKey)) {
      moduleMaps.set(shareKey, version);
    }
  }

  const moduleArray = Array.from(moduleMaps.entries());
  const code = [
    'var chunkQueue = [];',
    'var resport = [];',
    `var cnn = ${JSON.stringify(appName)};`,
    "var chunkLoadingGlobal = self['webpackChunk' + cnn] || [];",
    `var preferredModules = new Set(${JSON.stringify(
      Object.keys(DEFAULT_SHARE_SCOPE_BROWSER)
    )});`,
    `var initialConsumes = ${JSON.stringify(moduleArray)}`,
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

              const processChunksEagerRemote = (
                chunks: Set<Chunk>,
                callback: (modules: Iterable<Module>, chunk?: Chunk) => void
              ): void => {
                for (const chunk of chunks) {
                  const modules =
                    compilation.chunkGraph.getChunkModulesIterableBySourceType(
                      chunk,
                      'remote'
                    );
                  //@ts-ignore
                  if (modules) callback(modules, chunk);
                }
              };
              // if (
              //   this.options.server &&
              //   compiler.options.output.uniqueName === 'home_app'
              // ) {
              //   if (entrypoint.name.includes('pages')) {
              //     const remoteModule =
              //       compilation.chunkGraph.getChunkModulesIterableBySourceType(
              //         entrypoint,
              //         'remote'
              //       );
              //     const initalRemotes = this.initialRemoteModules;
              //     const allReferencedChunks =
              //       entrypoint.getAllReferencedChunks();
              //     const ename = entrypoint.name;
              //     const asyncEntryChunks = entrypoint.getAllAsyncChunks();
              //     const initialEntryChunks = entrypoint.getAllInitialChunks();
              //     const founds = [];
              //     initialEntryChunks.forEach((chunk) => {
              //       const foun =
              //         compilation.chunkGraph.getChunkModulesIterableBySourceType(
              //           chunk,
              //           'remote'
              //         );
              //
              //       if (foun) founds.push([...(foun || [])]);
              //     });
              //   }
              // }
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
              // console.log(this.initialModules);
              // if (runtimeModule.constructor.name) {
              //   console.log(
              //     'found runtime module',
              //     runtimeModule.constructor.name,
              //     'in chunk:',
              //     chunk.name
              //   );
              // }
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
                '// Custom code here\n',
                getCustomJsonpCode(
                  //@ts-ignore
                  compiler.options.output.uniqueName,
                  compiler.webpack.RuntimeGlobals,
                  this.initialModules,
                  this.initialModulesResolved
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
