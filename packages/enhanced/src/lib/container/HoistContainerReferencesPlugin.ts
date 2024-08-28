import {
  Compiler,
  Compilation,
  Chunk,
  WebpackPluginInstance,
  Module,
  ExternalModule,
  runtime,
} from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type EntryDependency from 'webpack/lib/dependencies/EntryDependency';
import ContainerEntryDependency from './ContainerEntryDependency';
import ContainerEntryModule from './ContainerEntryModule';

const { NormalModule } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
const ConcatenatedModule = require(
  normalizeWebpackPath('webpack/lib/optimize/ConcatenatedModule'),
) as typeof import('webpack/lib/optimize/ConcatenatedModule');

const PLUGIN_NAME = 'HoistContainerReferences';

export class HoistContainerReferences implements WebpackPluginInstance {
  private readonly containerName: string;
  private readonly bundlerRuntimePath?: string;
  private readonly explanation: string;

  constructor(name?: string, bundlerRuntimePath?: string) {
    this.containerName = name || 'no known chunk name';
    this.bundlerRuntimePath = bundlerRuntimePath;
    this.explanation =
      'Bundler runtime path module is required for proper functioning';
  }

  apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      PLUGIN_NAME,
      (compilation: Compilation) => {
        compilation.hooks.addEntry.tap('RuntimeChunkPlugin', (_, entry) => {
          const { name: entryName } = entry;
          if (entryName === 'checkout') return;
          if (entryName === 'checkout_partial') return;
          if (entryName === undefined) return;
          // debugger;

          // const data =
          //   /** @type {EntryData} */
          //   (compilation.entries.get(entryName));
          //   //@ts-ignore
          // if (data.options.runtime === undefined && !data.options.dependOn) {
          //   // Determine runtime chunk name
          //   let name =
          //     /** @type {string | ((entrypoint: { name: string }) => string)} */
          //     //@ts-ignore
          //     (this.options.name);
          //   if (typeof name === "function") {
          //     name = name({ name: entryName });
          //   }
          //   //@ts-ignore
          //   data.options.runtime = name;
          // }
        });

        const logger = compilation.getLogger(PLUGIN_NAME);
        const { chunkGraph, moduleGraph } = compilation;
        compilation.hooks.optimizeChunks.tap(
          {
            name: PLUGIN_NAME,
            stage: 11, // advanced + 1
          },
          (chunks: Iterable<Chunk>) => {
            const runtimeChunks = this.getRuntimeChunks(compilation);
            this.hoistModulesInChunks(
              compilation,
              runtimeChunks,
              chunks,
              logger,
            );
          },
        );

        // compilation.hooks.optimizeDependencies.tap(
        //   PLUGIN_NAME,
        //   (modules: Iterable<Module>) => {
        //
        //     return;
        //
        //     if (this.bundlerRuntimePath) {
        //       let runtime;
        //       for (const [name, { options }] of compilation.entries) {
        //         runtime = compiler.webpack.util.runtime.mergeRuntimeOwned(runtime, compiler.webpack.util.runtime.getEntryRuntime(
        //           compilation,
        //           name,
        //           options
        //         ));
        //       }
        //
        //       for (const module of modules) {
        //         if (
        //           module instanceof NormalModule &&
        //           module.resource === this.bundlerRuntimePath
        //         ) {
        //           // const exportsInfo = moduleGraph.getExportsInfo(module);
        //           //TODO: support refrenceless runtime, per runtime chunk
        //           //exportsInfo.setUsedInUnknownWay(runtime);
        //           // moduleGraph.addExtraReason(module, this.explanation);
        //           // if (module.factoryMeta === undefined) {
        //           //   module.factoryMeta = {};
        //           // }
        //           // module.factoryMeta.sideEffectFree = false;
        //         }
        //       }
        //     }
        //   }
        // );
      },
    );
  }

  private getAllReferencedModules(compilation: Compilation, module: Module) {
    const collectedModules = new Set<Module>([module]);
    const collectOutgoingConnections = (module: Module) => {
      const mgm = compilation.moduleGraph._getModuleGraphModule(module);
      if (mgm && mgm.outgoingConnections) {
        for (const connection of mgm.outgoingConnections) {
          if (connection?.module && !collectedModules.has(connection.module)) {
            collectedModules.add(connection.module);
            collectOutgoingConnections(connection.module);
          }
        }
      }
    };

    if (module) {
      collectOutgoingConnections(module);
    }
    return collectedModules;
  }

  private findModule(
    compilation: Compilation,
    chunk: Chunk,
    bundlerRuntimePath: string,
  ): Module | null {
    const { chunkGraph } = compilation;
    for (const mod of chunkGraph.getChunkModulesIterable(chunk)) {
      if (mod instanceof NormalModule && mod.resource === bundlerRuntimePath) {
        return mod;
      }

      if (mod instanceof ConcatenatedModule) {
        for (const m of mod.modules) {
          if (m instanceof NormalModule && m.resource === bundlerRuntimePath) {
            return mod;
          }
        }
      }
    }
    return null;
  }

  private hoistModulesInChunks(
    compilation: Compilation,
    runtimeChunks: Set<Chunk>,
    chunks: Iterable<Chunk>,
    logger: ReturnType<Compilation['getLogger']>,
  ): void {
    const { chunkGraph, moduleGraph } = compilation;
    const partialChunk = this.containerName
      ? compilation.namedChunks.get(this.containerName)
      : undefined;
    let runtimeModule;

    const modulePerRuntime = new Map();
    //@ts-ignore
    const connectReferenceingModules = (runtime, module) => {
      const allReferencedModules = this.getAllReferencedModules(
        compilation,
        module,
      );
      const partialChunk = compilation.namedChunks.get(runtime + '_partial');
      const runtimeChunk = compilation.namedChunks.get(runtime);
      if (!partialChunk || !runtimeChunk) return;

      for (const refMod of allReferencedModules) {
        if (!chunkGraph.isModuleInChunk(refMod, runtimeChunk)) {
          chunkGraph.connectChunkAndModule(runtimeChunk, refMod);
        }
      }
    };

    const entryModules = new Set<Module>();

    for (const [name, { options, dependencies }] of compilation.entries) {
      const entryRuntime =
        compilation.compiler.webpack.util.runtime.getEntryRuntime(
          compilation,
          name,
          options,
        );
      // if (modulePerRuntime.has(entryRuntime)) continue;
      for (const dep of dependencies) {
        if (dep.type === 'container entry') {
          const containerEntryModule = moduleGraph.getModule(
            dep,
          ) as ContainerEntryModule;

          entryModules.add(containerEntryModule);
          continue;
        }
        if (dep.type === 'entry') {
          const entryDep = dep as EntryDependency;
          if (entryDep.request && entryDep.request.includes('.federation')) {
            entryModules.add(moduleGraph.getModule(dep) as Module);
            break;
          }
        }
      }
    }
    for (const entry of entryModules) {
      //@ts-ignore
      const runtimes = chunkGraph.getModuleRuntimes(entry);
      let allReferencedModules;
      if (entry instanceof ContainerEntryModule) {
        allReferencedModules = this.getAllReferencedModules(
          compilation,
          moduleGraph.getModule(
            entry.dependencies[1] as EntryDependency,
          ) as Module,
        );
        allReferencedModules.add(entry);
      } else {
        allReferencedModules = this.getAllReferencedModules(compilation, entry);
      }
      for (const runtime of runtimes) {
        compilation.compiler.webpack.util.runtime.forEachRuntime(
          runtime,
          (runtime) => {
            if (!runtime) return;
            const runtimeChunk = compilation.namedChunks.get(runtime);
            const entryChunk = compilation.namedChunks.get(
              runtime + '_partial',
            );
            if (runtimeChunk) {
              if (entryChunk) {
                for (const module of chunkGraph.getChunkModulesIterable(
                  entryChunk,
                )) {
                  allReferencedModules.add(module);
                }
                compilation.chunkGraph.disconnectChunk(entryChunk);
                // compilation.chunks.delete(entryChunk);
                // if(entryChunk.name) compilation.namedChunks.delete(entryChunk.name);
              }
              for (const refMod of allReferencedModules) {
                if (!chunkGraph.isModuleInChunk(refMod, runtimeChunk)) {
                  chunkGraph.connectChunkAndModule(runtimeChunk, refMod);
                }
              }
            }
          },
        );
      }
      this.cleanUpChunks(compilation, allReferencedModules);
    }

    // for (const runtimeChunk of runtimeChunks) {
    //   const rChunk = compilation.namedChunks.get(runtimeChunk.name + '_partial');
    //   if(!rChunk) continue;
    //   compilation.chunkGraph.disconnectChunk(rChunk);
    //
    //   rChunk.name && compilation.namedChunks.delete(rChunk.name);
    //
    //   compilation.chunks.delete(rChunk);
    // }
    // for (const chunk of chunks) {
    //   if (
    //     chunkGraph.getNumberOfEntryModules(chunk) > 0 &&
    //     this.bundlerRuntimePath
    //   ) {
    //     runtimeModule = this.findModule(
    //       compilation,
    //       chunk,
    //       this.bundlerRuntimePath
    //     );
    //     if (runtimeModule) break;
    //   }
    // }

    // if (partialChunk) {
    //
    //   modulePerRuntime.set('unknown', moduleGraph.getModule(
    //     partialChunk.entryModule.dependencies[1]
    //   ));
    // }

    // allReferencedModules = this.getAllReferencedModules(
    //   compilation,
    //   runtimeModule
    // );

    //     const allModules = new Set<Module>();
    //     const chunkdToRemove = new Set<Chunk>();
    //     for (const runtime of runtimeChunks) {
    //       //@ts-ignore
    //       const pChunk = compilation.namedChunks.get(runtime.name + '_partial');
    //
    //       if (!pChunk) continue;
    //       chunkdToRemove.add(pChunk);
    //       const emod = chunkGraph.getChunkEntryModulesIterable(pChunk);
    //       //@ts-ignore
    //       const entry = pChunk.entryModule;
    //       // debugger;
    //
    //       const runtimeModule = moduleGraph.getModule(entry.dependencies[1]);
    //       const allReferencedModules = this.getAllReferencedModules(
    //         compilation,
    //         runtimeModule as Module
    //       );
    //
    // //@ts-ignore
    //       for (const module of chunkGraph.getChunkModulesIterable(pChunk)) {
    //         allReferencedModules.add(module);
    //       }
    //
    //
    //       for (const module of allReferencedModules) {
    //         allModules.add(module);
    //         if (!chunkGraph.isModuleInChunk(module, runtime)) {
    //           chunkGraph.connectChunkAndModule(runtime, module);
    //         }
    //       }
    //     }

    // for (const rChunk of chunkdToRemove) {
    //   //@ts-ignore
    //   compilation.chunkGraph.disconnectChunk(rChunk);
    //
    //   rChunk.name && compilation.namedChunks.delete(rChunk.name);
    //
    //   compilation.chunks.delete(rChunk);
    // }
    // this.cleanUpChunks(compilation, allModules);

    const rootRefs = new Set<Module>();
    // for (const [runtime, runtimeModule] of modulePerRuntime) { // Removed type annotation for runtimeModule
    //
    //   if (!runtimeModule) {
    //     logger.error('unable to find runtime module');
    //     return;
    //   }
    //   let allReferencedModules;
    //   if (runtimeModule instanceof ContainerEntryModule) {
    //
    //     allReferencedModules = this.getAllReferencedModules(
    //       compilation,
    //       moduleGraph.getModule(runtimeModule.dependencies[1] as EntryDependency) as Module // Added type assertion
    //     );
    //     allReferencedModules.add(runtimeModule);
    //   } else {
    //     allReferencedModules = this.getAllReferencedModules(
    //       compilation,
    //       runtimeModule
    //     );
    //   }
    //
    //   for (const m of allReferencedModules) {
    //     rootRefs.add(m);
    //   }
    //
    //   if (runtime === 'webpack-api-runtime') {
    //     // debugger; // Removed debugger statement
    //   }
    //
    //   // if is single runtime chunk, copy the remoteEntry into the runtime chunk to allow for embed container
    //   if (partialChunk) {
    //     for (const module of chunkGraph.getChunkModulesIterable(partialChunk)) {
    //       rootRefs.add(module);
    //     }
    //   }
    //
    //   // for (const runtimeChunk of runtimeChunks) {
    //   for (const module of allReferencedModules) {
    //     const runtimes = compilation.chunkGraph.getModuleRuntimes(module);
    //     if (module instanceof ContainerEntryModule) {
    //       for (const runtimeChunk of runtimeChunks) {
    //         chunkGraph.connectChunkAndModule(runtimeChunk, module);
    //       }
    //     }
    //     for (const runtime of runtimes) {
    //       compilation.compiler.webpack.util.runtime.forEachRuntime(runtime, (rt) => {
    //         if (!rt) return;
    //         const runtimeChunk = compilation.namedChunks.get(rt);
    //         if (!runtimeChunk) return;
    //         chunkGraph.connectChunkAndModule(runtimeChunk, module);
    //
    //       });
    //     }
    //
    //     // // if module NOT belong to the runtime, skip.
    //     // if (!runtimes.has(runtimeChunk.name)) continue;
    //     // //skip if module already in chunk
    //     // if (chunkGraph.isModuleInChunk(module, runtimeChunk)) continue;
    //     // //connect chunk and module
    //     // chunkGraph.connectChunkAndModule(runtimeChunk, module);
    //
    //     // }
    //   }
    //   this.cleanUpChunks(compilation, allReferencedModules);
    // }
  }

  private cleanUpChunks(compilation: Compilation, modules: Set<Module>): void {
    const { chunkGraph } = compilation;
    for (const module of modules) {
      for (const chunk of chunkGraph.getModuleChunks(module)) {
        if (chunk?.name?.endsWith('_partial')) {
          debugger;
        }
        if (!chunk.hasRuntime()) {
          chunkGraph.disconnectChunkAndModule(chunk, module);
          if (
            chunkGraph.getNumberOfChunkModules(chunk) === 0 &&
            chunkGraph.getNumberOfEntryModules(chunk) === 0
          ) {
            chunkGraph.disconnectChunk(chunk);
            compilation.chunks.delete(chunk);
            if (chunk.name) compilation.namedChunks.delete(chunk.name);
          }
        }
      }
    }
    modules.clear();
  }

  private getRuntimeChunks(compilation: Compilation): Set<Chunk> {
    const runtimeChunks = new Set<Chunk>();
    const entries = compilation.entrypoints;

    for (const entrypoint of entries.values()) {
      const runtimeChunk = entrypoint.getRuntimeChunk();
      if (runtimeChunk) {
        runtimeChunks.add(runtimeChunk);
      }
    }
    return runtimeChunks;
  }
}

export default HoistContainerReferences;
