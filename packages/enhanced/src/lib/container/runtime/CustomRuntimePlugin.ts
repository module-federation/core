import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type webpack from 'webpack';
import CustomRuntimeModule from './CustomRuntimeModule';

const { RuntimeModule, Template, RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');
import type { Compilation } from 'webpack';
import fs from 'fs';

const ModuleDependency = require(
  normalizeWebpackPath('webpack/lib/dependencies/ModuleDependency'),
) as typeof import('webpack/lib/dependencies/ModuleDependency');
const WebpackError = require(
  normalizeWebpackPath('webpack/lib/WebpackError'),
) as typeof import('webpack/lib/WebpackError');

class CustomRuntimePlugin {
  private entryPath: string;
  private bundledCode: string | null = null;

  constructor(path: string) {
    this.entryPath = path;
  }

  apply(compiler: webpack.Compiler): void {
    compiler.options.plugins = [];

    compiler.hooks.make.tapAsync(
      'CustomRuntimePlugin',
      (compilation: Compilation, callback: (err?: Error) => void) => {
        if (this.bundledCode) return callback();
        const runtimeModulePath = require
          .resolve('@module-federation/webpack-bundler-runtime/vendor')
          .replace('cjs', 'esm');

        const runtimeModuleContent = fs.readFileSync(
          runtimeModulePath,
          'utf-8',
        );

        const runtimeModuleDataURI = `data:text/javascript;base64,${Buffer.from(runtimeModuleContent).toString('base64')}`;

        const childCompiler = compiler.createChildCompiler(
          compiler.createCompilation(),
          'CustomRuntimePluginCompiler',
          0,
          {
            filename: 'custom-runtime-bundle.js',
            library: {
              type: 'var',
              name: 'federation',
              export: 'default',
            },
          },
          [
            new compiler.webpack.EntryPlugin(
              compiler.context,
              runtimeModulePath,
              {
                name: 'custom-runtime-bundle',
              },
            ),
            new compiler.webpack.library.EnableLibraryPlugin('var'),
          ],
        );
        childCompiler.options.devtool = undefined;

        console.log('create child compiler for', runtimeModulePath);
        childCompiler.runAsChild(
          (
            err?: Error | null,
            entries?: webpack.Chunk[],
            childCompilation?: webpack.Compilation,
          ) => {
            if (err) return callback(err);
            if (childCompilation && childCompilation.errors.length > 0) {
              return callback(childCompilation.errors[0]);
            }

            this.bundledCode = (
              childCompilation?.assets[
                'custom-runtime-bundle.js'
              ].source() as string
            ).replace(/#\s*sourceMappingURL=\S+?\.map/g, '');
            callback();
          },
        );
      },
    );

    compiler.hooks.thisCompilation.tap(
      'CustomRuntimePlugin',
      (compilation: webpack.Compilation) => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'CustomRuntimePlugin',
          (chunk: webpack.Chunk, set: Set<string>) => {
            if (set.has('embeddedFederationRuntime')) return;
            if (!set.has(`${RuntimeGlobals.require}.federation`)) return;

            if (
              this.bundledCode &&
              set.has(`${RuntimeGlobals.require}.federation`)
            ) {
              set.add('embeddedFederationRuntime');
              const runtimeModule = new CustomRuntimeModule(this.bundledCode);
              compilation.addRuntimeModule(chunk, runtimeModule);
            }
          },
        );
      },
    );
  }
}

export default CustomRuntimePlugin;
