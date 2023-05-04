import type { Chunk, Compiler } from 'webpack';
import type { ModuleFederationPluginOptions } from '../types';
import { ConcatSource, RawSource, ReplaceSource } from 'webpack-sources';
import RuntimeGlobals from 'webpack/lib/RuntimeGlobals';
import StartupChunkDependenciesPlugin from 'webpack/lib/runtime/StartupChunkDependenciesPlugin';
import template from './custom-jsonp';
import ChunkLoadingRuntimeModule from './LoadFileChunkLoadingRuntimeModule';

interface CommonJsChunkLoadingOptions extends ModuleFederationPluginOptions {
  baseURI: Compiler['options']['output']['publicPath'];
  promiseBaseURI?: string;
  remotes: Record<string, string>;
  name?: string;
  asyncChunkLoading: boolean;
  verbose?: boolean;
  invertedBoot?: boolean;
}

class CommonJsChunkLoadingPlugin {
  private options: CommonJsChunkLoadingOptions;
  private _asyncChunkLoading: boolean;

  constructor(options: CommonJsChunkLoadingOptions) {
    this.options = options || ({} as CommonJsChunkLoadingOptions);
    this._asyncChunkLoading = this.options.asyncChunkLoading;
  }

  apply(compiler: Compiler) {
    const chunkLoadingValue = this._asyncChunkLoading
      ? 'async-node'
      : 'require';

    new StartupChunkDependenciesPlugin({
      chunkLoading: chunkLoadingValue,
      asyncChunkLoading: this._asyncChunkLoading,
    }).apply(compiler);

    compiler.hooks.thisCompilation.tap(
      'CommonJsChunkLoadingPlugin',
      (compilation) => {
        // Always enabled
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const isEnabledForChunk = (_: Chunk) => true;
        const onceForChunkSet = new WeakSet();

        const handler = (chunk: Chunk, set: Set<string>) => {
          if (onceForChunkSet.has(chunk)) return;

          onceForChunkSet.add(chunk);

          if (!isEnabledForChunk(chunk)) return;

          set.add(RuntimeGlobals.moduleFactoriesAddOnly);
          set.add(RuntimeGlobals.hasOwnProperty);

          compilation.addRuntimeModule(
            chunk,
            new ChunkLoadingRuntimeModule(set, this.options, {
              webpack: compiler.webpack,
            })
          );
        };

        const hooks =
          compiler.webpack.javascript.JavascriptModulesPlugin.getCompilationHooks(
            compilation
          );
        hooks.renderStartup.tap(
          'AddCommentWebpackPlugin',
          //@ts-ignore
          (source, renderContext) => {
            //@ts-ignore
            // const { chunk } = renderContext;

            // Check if the chunk is an entrypoint
            // const isEntrypoint = Array.from(
            //   compilation.entrypoints.values()
            // ).some((entrypoint) => entrypoint.getEntrypointChunk() === chunk);

            // if (!isEntrypoint) {
            //   return source;
            // }
            // console.log(renderContext);
            // Add a comment to the beginning of the chunk
            //@ts-ignore
            let replaceSource = source.source().split('\n');
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
              replaceSource[1] = `var ${searchString} = function(moduleId) {
              ${template}
              console.log('[node]: next attempting to call', moduleId);
              console.log('[node]: intercepting', moduleId,'instantiation');

              var cnn = ${JSON.stringify(compiler.options.output.uniqueName)};
               return asyncOperation().then(() => {
             console.log('after init, before callback');
                     console.log('before callback',Object.keys(__webpack_require__.S.default|| {'EMPTY': 'EMPTY'}));
              console.log('preheating entry, but not returning', moduleId);
              const entrypoint = ${replaceString}(moduleId);
              console.log('preheat:',entrypoint);
               return new Promise((resolve, reject) => {
              console.log('after callback',Object.keys(__webpack_require__.S.default|| {'EMPTY': 'EMPTY'}));
              console.log('after callback',__webpack_require__.S.default['react/jsx-dev-runtime']['18.2.0'].get());
              setTimeout(() => {
              console.log('resolving entry to next', moduleId);
              resolve(${replaceString}(moduleId))
              },2000)
               });
               // return ${replaceString}(moduleId);
               })
              };
console.log('loose in runtim emodule',Object.keys(__webpack_require__.S.default|| {'EMPTY': 'EMPTY'}));
              `;

              return new RawSource(replaceSource.join('\n'));
            }
            // source.toString();
            const comment = `/* This is an entrypoint chunk: */\n`;
            //@ts-ignore
            return new ConcatSource(source, comment);
          }
        );

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap('CommonJsChunkLoadingPlugin', handler);

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('CommonJsChunkLoadingPlugin', handler);

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap('CommonJsChunkLoadingPlugin', handler);

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.baseURI)
          .tap('CommonJsChunkLoadingPlugin', handler);

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.externalInstallChunk)
          .tap('CommonJsChunkLoadingPlugin', handler);

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.onChunksLoaded)
          .tap('CommonJsChunkLoadingPlugin', handler);

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.ensureChunkHandlers)
          .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) return;
            set.add(RuntimeGlobals.getChunkScriptFilename);
          });

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadUpdateHandlers)
          .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) return;
            set.add(RuntimeGlobals.getChunkUpdateScriptFilename);
            set.add(RuntimeGlobals.moduleCache);
            set.add(RuntimeGlobals.hmrModuleData);
            set.add(RuntimeGlobals.moduleFactoriesAddOnly);
          });

        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.hmrDownloadManifest)
          .tap('CommonJsChunkLoadingPlugin', (chunk, set) => {
            if (!isEnabledForChunk(chunk)) return;
            set.add(RuntimeGlobals.getUpdateManifestFilename);
          });
      }
    );
  }
}

export default CommonJsChunkLoadingPlugin;
