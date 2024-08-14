import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type webpack from 'webpack';
import CustomRuntimeModule from './CustomRuntimeModule';
const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');
const WebpackError = require(
  normalizeWebpackPath('webpack/lib/WebpackError'),
) as typeof import('webpack/lib/WebpackError');

class CustomRuntimePlugin {
  private entryPath: string;

  constructor(path: string) {
    this.entryPath = path;
  }

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'CustomRuntimePlugin',
      (compilation: webpack.Compilation) => {
        compilation.hooks.additionalChunkRuntimeRequirements.tap(
          'CustomRuntimePlugin',
          (chunk: webpack.Chunk, set: Set<string>) => {
            set.add('CustomRuntimeModule');
            const runtimeModule = new CustomRuntimeModule(this.entryPath);
            compilation.addRuntimeModule(chunk, runtimeModule);
          },
        );
      },
    );
  }
}

export default CustomRuntimePlugin;
