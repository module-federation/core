import type {
  Compiler,
  ModuleFederationPluginOptions,
  WebpackPluginInstance,
} from '@rspack/core';

interface CompilerModuleFederationPlugin extends WebpackPluginInstance {
  _options: ModuleFederationPluginOptions;
}

export const createCompilerModuleFederationPlugin = (
  options: ModuleFederationPluginOptions,
): CompilerModuleFederationPlugin => ({
  _options: options,
  apply(compiler: Compiler) {
    new compiler.webpack.container.ModuleFederationPlugin(options).apply(
      compiler,
    );
  },
});
