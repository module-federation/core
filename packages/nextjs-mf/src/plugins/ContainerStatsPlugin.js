const fs = require('fs');
const path = require('path');

class ModuleChunkDependencyPlugin {
  constructor(federationOptions) {
    this.federationOptions = federationOptions;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync(
      'ModuleChunkInfoPlugin',
      (compilation, callback) => {
        const moduleChunkInfo = {};

        compilation.chunks.forEach((chunk) => {
          chunk.getModules().forEach((module) => {
            if (module?.request?.includes('menu.tsx')) {
              const identifier = module.identifier();
              const relativePath = path.relative(compiler.context, identifier);

              if (!moduleChunkInfo[relativePath]) {
                moduleChunkInfo[relativePath] = [];
              }

              moduleChunkInfo[relativePath].push(chunk.id);
            }
          });
        });
        console.log('moduleChunkInfo', moduleChunkInfo);
        // const jsonContent = JSON.stringify(moduleChunkInfo, null, 2);
        // compilation.assets[this.outputFile] = {
        //   source: () => jsonContent,
        //   size: () => jsonContent.length,
        // };

        callback();
      }
    );
    return;

    // eslint-disable-next-line no-unreachable
    compiler.hooks.afterEmit.tapAsync(
      'ModuleChunkDependencyPlugin',
      (compilation, callback) => {
        const { entrypoints, chunkGraph } = compilation;
        const container = entrypoints.get(this.federationOptions.name);
        const entryChunk = container.getEntrypointChunk();
        const modulesInChunk = chunkGraph.getChunkModulesIterable(entryChunk);
        const gotChunks = chunkGraph.getChunkModules(entryChunk);

        const findExposed = gotChunks.find((module) => {
          return module._exposes;
        });
        const containerChunk = findExposed.getChunks().find((chunk) => {
          return chunk.name === this.federationOptions.name;
        });
        if (!containerChunk) return;
        // console.log('entryChunk',entryChunk);
        // console.log('gotChunks', gotChunks)
        // console.log('modulesInChunk', modulesInChunk);
        // console.log('containerChunk',containerChunk)
        // console.log('getChunkMaps',containerChunk.getChunkMaps())
        // console.log('getAllReferencedChunks',containerChunk.getAllReferencedChunks())
        const referencedChunks = containerChunk.getAllReferencedChunks();

        console.log(referencedChunks);

        // console.log(referencedChunks);
        // referencedChunks.forEach((chunk) => {
        //   console.log(chunk.id, chunk.getModules());
        // })
        // const moduleMap  = containerChunk.getChunkModuleMaps((module) => {
        //   return module.id
        // });
        // console.log(moduleMap)

        // console.log('getChunkModuleMaps',containerChunk.getChunkModuleMaps((module) => {
        //   console.log(module.id, module.rawRequest)
        // }))
        // console.log('findExposed',findExposed)
        // console.log('getchunks', containerChunk);
        // console.log('getChunkModules', chunkGraph.getChunkModules(containerChunk));
        // console.log('getModuleChunks', chunkGraph.getModuleChunks(findExposed));

        const moduleChunkDependencyMap = {};
        const swappedExposes = Object.entries(
          this.federationOptions.exposes
        ).reduce((acc, [key, value]) => {
          acc[value] = key;
          return acc;
        }, {});
        const exposesEntries = Object.entries(swappedExposes);
        // const chunkGraph = compilation.chunkGraph;

        for (const module of compilation.modules) {
          let exposedKey;
          let exposedFile;
          if (
            !exposesEntries.some(([exposedPath, exposedName]) => {
              if (
                module.rawRequest &&
                module.rawRequest.startsWith(exposedPath)
              ) {
                exposedKey = exposedName;
                exposedFile = exposedPath;
                return true;
              }
            })
          ) {
            continue;
          }

          const dependentChunksSet = new Set();
          // module.dependencies.forEach((dependency) => {
          //   // console.log(dependency);
          //   let dependentModule =
          //     dependency?._parentModule?.rawRequest?.startsWith(exposedFile)
          //       ? dependency._parentModule
          //       : null;
          //
          //   if (dependentModule) {
          //     const moduleChunks = Array.from(
          //       chunkGraph.getModuleChunks(dependentModule)
          //     );
          //     moduleChunks.forEach((chunk) => {
          //       if(exposedKey.includes('menu')) {
          //         console.log({
          //           hasRuntime: chunk.hasRuntime(),
          //           chunk,
          //           dependentModule,
          //           isIn: chunkGraph.isModuleInChunk(dependentModule, chunk)
          //         });
          //       }
          //       if (
          //         typeof chunk.runtime === 'string' &&
          //         chunk.runtime !== this.federationOptions.name
          //       ) {
          //         return;
          //       }
          //       if (
          //         !chunk.runtime.toJSON().includes(this.federationOptions.name)
          //       ) {
          //         return;
          //       }
          //       // if(exposedKey.includes('menu')) {
          //       //   console.log('chunk',chunk)
          //       // }
          //       dependentChunksSet.add(chunk);
          //     });
          //   }
          // });

          // moduleChunkDependencyMap[exposedKey] = Array.from(dependentChunksSet);

          const moduleId = chunkGraph.getModuleId(module);
          if (module.request && module.request.includes('menu')) {
            const containerd = Array.from(referencedChunks).filter((c) => {
              return c.containsModule(module);
            });
            console.log({ containerd });
          }
          // console.log({req: module.request, getChunks:module.getChunks(), getModuleChunks: chunkGraph.getModuleChunks(module)});
          // module.getChunks().forEach((chunk) => {
          //   console.log({req:module.request,chunk:chunk.id,containsModule:chunk.containsModule(module), module:chunkGraph.getChunkModules(chunk)})
          //
          // })
          // console.log({getModuChunk:chunkGraph.getModuleChunks(module), referencedChunks})
          const dependentChunks = Array.from(
            chunkGraph.getModuleChunks(module)
          ).reduce((acc, chunk) => {
            // console.log('has ref chunk',referencedChunks.has(chunk));
            if (
              referencedChunks.has(chunk)
              // chunk.runtime === this.federationOptions.name ||
              // (chunk.runtime.toJSON && chunk.runtime.toJSON().includes(this.federationOptions.name))
            ) {
              if (exposedKey === './menu') {
                // console.log(chunk);
              }
              // console.log(chunk.files,chunk.runtime.toJSON().includes(this.federationOptions.name))
              acc.push(...chunk.files);
            }
            return acc;
          }, []);
          // console.log(exposedKey, moduleId,chunkGraph.getModuleChunks(module));
          moduleChunkDependencyMap[exposedKey] = dependentChunks;
        }

        console.log(moduleChunkDependencyMap);

        // const jsonOutput = JSON.stringify(moduleChunkDependencyMap, null, 2);
        // console.log(jsonOutput);
        // callback()
        // fs.writeFile(this.outputPath, jsonOutput, (err) => {
        //   if (err) {
        //     console.error('Error writing module chunk dependency JSON:', err);
        //   } else {
        //     console.log('Module chunk dependency JSON written successfully');
        //   }
        callback();
        // });
      }
    );
  }
}

export default ModuleChunkDependencyPlugin;
