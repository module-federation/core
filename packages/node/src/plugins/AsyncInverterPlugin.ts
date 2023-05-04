import type { Chunk, Compiler, Compilation } from 'webpack';
import Template from 'webpack/lib/Template';
import type { ModuleFederationPluginOptions } from '../types';
import { ConcatSource, RawSource, ReplaceSource } from 'webpack-sources';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import StartupChunkDependenciesPlugin from 'webpack/lib/runtime/StartupChunkDependenciesPlugin';
import template from './custom-jsonp';
import ChunkLoadingRuntimeModule from './LoadFileChunkLoadingRuntimeModule';
import { Module, RuntimeModule } from 'webpack';

interface CommonJsChunkLoadingOptions extends ModuleFederationPluginOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  asyncChunkLoading: boolean;
  verbose?: boolean;
  invertedBoot?: boolean;
}

class AsyncInverterPlugin {
  private options: CommonJsChunkLoadingOptions;
  private initialRemoteModules: Map<any, any>;

  constructor(options: CommonJsChunkLoadingOptions) {
    this.options = options || ({} as CommonJsChunkLoadingOptions);
    // eager imports of remote container modules
    this.initialRemoteModules = new Map();
  }
  //@ts-ignore
  mapChunks(compilation) {
    // @ts-ignore
    const { chunkGraph } = compilation;
    const { runtimeTemplate, moduleGraph } = compilation;
    const chunkToRemotesMapping = {};
    const idToExternalAndNameMapping = {};

    for (const entrypointModule of compilation.entrypoints.values()) {
      const entrypoint = entrypointModule.getEntrypointChunk();
      if (entrypoint.hasRuntime()) continue;

      for (const chunk of entrypoint.getAllInitialChunks()) {
        const modules = chunkGraph.getChunkModulesIterableBySourceType(
          chunk,
          'remote'
        );
        if (!modules) continue;
        //@ts-ignore
        const remotes = (chunkToRemotesMapping[chunk.id || chunk.name] = []);
        for (const m of modules) {
          const module = /** @type {RemoteModule} */ m;
          const name = module.internalRequest;
          const id = chunkGraph.getModuleId(module);
          const shareScope = module.shareScope;
          const dep = module.dependencies[0];
          const externalModule = moduleGraph.getModule(dep);
          const externalModuleId =
            externalModule && chunkGraph.getModuleId(externalModule);
          //@ts-ignore
          remotes.push(id);
          //@ts-ignore
          idToExternalAndNameMapping[id] = [shareScope, name, externalModuleId];
        }

        // console.log('idToExternalAndNameMapping', idToExternalAndNameMapping);
        // console.log('chunkToRemotesMapping', chunkToRemotesMapping);
        // console.log('remotes', remotes);
      }
    }

    return Template.asString([
      `var chunkMapping = ${JSON.stringify(
        chunkToRemotesMapping,
        null,
        '\t'
      )};`,
      `var idToExternalAndNameMapping = ${JSON.stringify(
        idToExternalAndNameMapping,
        null,
        '\t'
      )};`,
    ]);
    return Template.asString([
      `var chunkMapping = ${JSON.stringify(
        chunkToRemotesMapping,
        null,
        '\t'
      )};`,
      `var idToExternalAndNameMapping = ${JSON.stringify(
        idToExternalAndNameMapping,
        null,
        '\t'
      )};`,
      `${
        RuntimeGlobals.ensureChunkHandlers
      }.remotes = ${runtimeTemplate.basicFunction('chunkId, promises', [
        `if(${RuntimeGlobals.hasOwnProperty}(chunkMapping, chunkId)) {`,
        Template.indent([
          `chunkMapping[chunkId].forEach(${runtimeTemplate.basicFunction('id', [
            `var getScope = ${RuntimeGlobals.currentRemoteGetScope};`,
            'if(!getScope) getScope = [];',
            'var data = idToExternalAndNameMapping[id];',
            'if(getScope.indexOf(data) >= 0) return;',
            'getScope.push(data);',
            `if(data.p) return promises.push(data.p);`,
            `var onError = ${runtimeTemplate.basicFunction('error', [
              'if(!error) error = new Error("Container missing");',
              'if(typeof error.message === "string")',
              Template.indent(
                `error.message += '\\nwhile loading "' + data[1] + '" from ' + data[2];`
              ),
              `${
                RuntimeGlobals.moduleFactories
              }[id] = ${runtimeTemplate.basicFunction('', ['throw error;'])}`,
              'data.p = 0;',
            ])};`,
            `var handleFunction = ${runtimeTemplate.basicFunction(
              'fn, arg1, arg2, d, next, first',
              [
                'try {',
                Template.indent([
                  'var promise = fn(arg1, arg2);',
                  'if(promise && promise.then) {',
                  Template.indent([
                    `var p = promise.then(${runtimeTemplate.returningFunction(
                      'next(result, d)',
                      'result'
                    )}, onError);`,
                    `if(first) promises.push(data.p = p); else return p;`,
                  ]),
                  '} else {',
                  Template.indent(['return next(promise, d, first);']),
                  '}',
                ]),
                '} catch(error) {',
                Template.indent(['onError(error);']),
                '}',
              ]
            )}`,
            `var onExternal = ${runtimeTemplate.returningFunction(
              `external ? handleFunction(${RuntimeGlobals.initializeSharing}, data[0], 0, external, onInitialized, first) : onError()`,
              'external, _, first'
            )};`,
            `var onInitialized = ${runtimeTemplate.returningFunction(
              `handleFunction(external.get, data[1], getScope, 0, onFactory, first)`,
              '_, external, first'
            )};`,
            `var onFactory = ${runtimeTemplate.basicFunction('factory', [
              'data.p = 1;',
              `${
                RuntimeGlobals.moduleFactories
              }[id] = ${runtimeTemplate.basicFunction('module', [
                'module.exports = factory();',
              ])}`,
            ])};`,
            'handleFunction(__webpack_require__, data[2], 0, 0, onExternal, 1);',
          ])});`,
        ]),
        '}',
      ])}`,
    ]);
  }
  addRemoteModules(modules: Iterable<Module>, entry: Chunk): void {
    if (!this.initialRemoteModules.has(entry.name)) {
      this.initialRemoteModules.set(entry.name, new Set());
    }
    const existing = this.initialRemoteModules.get(entry.name);
    for (const module of modules) {
      existing.add(module);
    }
  }

  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap('AsyncInverterPlugin', (compilation) => {
      const processChunksEagerRemote = (chunks: Set<Chunk>): void => {
        console.log('process chunks eager remote');
        for (const chunk of chunks) {
          if (chunk.hasRuntime()) continue;
          const modules =
            compilation.chunkGraph.getChunkModulesIterableBySourceType(
              chunk,
              'remote'
            );

          console.log(chunk.name, 'has eager remotes');
          //@ts-ignore
          if (modules) this.addRemoteModules(modules, chunk);
        }
      };
      // Always enabled
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const isEnabledForChunk = (_: Chunk) => true;
      const onceForChunkSet = new WeakSet();

      const hooks =
        compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
          compilation
        );
      hooks.renderStartup.tap(
        'AddCommentWebpackPlugin',
        //@ts-ignore
        (source, renderContext) => {
          // for (const entrypointModule of compilation.entrypoints.values()) {
          //   const entrypoint = entrypointModule.getEntrypointChunk();
          //   if (entrypoint.hasRuntime()) continue;
          //
          //   // search chunks for eager remote imports
          //   // processChunksEagerRemote(
          //   //   // get all the initial chunks (non async) of the entrypoint
          //   //   entrypoint.getAllInitialChunks()
          //   // );
          //   this.mapChunks(compilation);
          // }

          const initialChunkMaps = this.mapChunks(compilation);
          //@ts-ignore
          const replaceSource = source.source().split('\n');
          const searchString = '__webpack_exec__';
          const replaceString = '__webpack_exec_proxy__';
          //@ts-ignore
          // replaceSource = replaceSource.replace(searchString, replaceString);
          if (replaceSource[0].includes(searchString)) {
            replaceSource[0] = replaceSource[0].replace(
              searchString,
              replaceString
            );
            replaceSource[2] = replaceSource[1];
            replaceSource[1] = `
              var cnn = ${JSON.stringify(compiler.options.output.uniqueName)};
              var cnn = ${JSON.stringify(compiler.options.output.uniqueName)};

              ${template}
console.log('chunkModuleMaps', chunkModuleMaps);
            var ${searchString} = function(moduleId) {
              console.log('[node]: next attempting to call', moduleId);
              console.log('[node]: intercepting', moduleId,'instantiation');
              console.log('checking if', exports.id, 'has eager remotes');

               return asyncOperation().then(() => {
             console.log('after init, before callback');
                    // console.log('before callback',Object.keys(__webpack_require__.S.default|| {'EMPTY': 'EMPTY'}));
              //console.log('preheating entry, but not returning', moduleId);
              const entrypoint = ${replaceString}(moduleId);
              //console.log('preheat:',entrypoint);
               return new Promise((resolve, reject) => {
             // console.log('after callback',Object.keys(__webpack_require__.S.default|| {'EMPTY': 'EMPTY'}));
              console.log('after callback',__webpack_require__.S.default['react/jsx-dev-runtime']['18.2.0'].get());
              setTimeout(() => {
              console.log('resolving entry to next', moduleId);
              resolve(${replaceString}(moduleId))
              },2000)
               });
               // return ${replaceString}(moduleId);
               })
              };
              `;
            return Template.asString([
              '',
              initialChunkMaps,
              '',
              ...replaceSource,
              '',
            ]);
          }
          const comment = `/* This is an entrypoint chunk: */\n`;
          //@ts-ignore
          return new ConcatSource(source, comment);
        }
      );
      compilation.hooks.runtimeModule.tap(
        'CustomWebpackPlugin',
        (runtimeModule: RuntimeModule, chunk: any) => {
          if (chunk.name === 'webpack-runtime') {
            if (runtimeModule.constructor.name === 'RemoteRuntimeModule') {
              console.log(
                'found runtime module',
                runtimeModule.constructor.name,
                'in chunk:',
                chunk.name
              );
              console.log('runtimeModule', runtimeModule);
            }
          }
        }
      );
      compilation.hooks.optimizeChunks.tap(
        'AddModulesToRuntimeChunkPlugin',
        (chunks) => {
          console.log('optimize chunks');
          for (const entrypointModule of compilation.entrypoints.values()) {
            const entrypoint = entrypointModule.getEntrypointChunk();
            // if (compiler.options.output.uniqueName === 'home_app') {
            //   const runtimeModules =
            //     compilation.chunkGraph.getChunkRuntimeModulesIterable(
            //       entrypoint
            //     );
            //   console.log(runtimeModules);
            // }
            if (entrypoint.hasRuntime()) continue;

            // search chunks for eager remote imports
            // processChunksEagerRemote(
            //   // get all the initial chunks (non async) of the entrypoint
            //   entrypoint.getAllInitialChunks()
            // );
            //  this.mapChunks(compilation, entrypoint);
          }
        }
      );
    });
  }
}

export default AsyncInverterPlugin;
