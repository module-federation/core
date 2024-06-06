import type { Compiler } from 'webpack';

import RemotePublicPathRuntimeModule from './RemotePublicPathRuntimeModule';

interface PluginOptions {}

class RemotePublicPathPlugin {
  private options?: PluginOptions;

  constructor(options?: PluginOptions) {
    this.options = options;
  }

  apply(compiler: Compiler) {
    const { RuntimeGlobals } = compiler.webpack;
    compiler.hooks.thisCompilation.tap(
      'RemotePublicPathPlugin',
      (compilation) => {
        compilation.hooks.runtimeRequirementInTree
          .for(RuntimeGlobals.publicPath)
          .tap('RuntimePlugin', (chunk, set) => {
            const { outputOptions } = compilation;
            const { publicPath: globalPublicPath, scriptType } = outputOptions;
            const entryOptions = chunk.getEntryOptions();
            const publicPath =
              entryOptions && entryOptions.publicPath !== undefined
                ? entryOptions.publicPath
                : globalPublicPath;

            const module = new RemotePublicPathRuntimeModule(this.options);
            if (publicPath === 'auto' && scriptType !== 'module') {
              set.add(RuntimeGlobals.global);
            } else if (
              typeof publicPath !== 'string' ||
              /\[(full)?hash\]/.test(publicPath)
            ) {
              module.fullHash = true;
            }

            compilation.addRuntimeModule(chunk, module);
            return true;
          });
      },
    );
  }
}

export default RemotePublicPathPlugin;
