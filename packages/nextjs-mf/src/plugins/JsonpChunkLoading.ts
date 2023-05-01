// CustomWebpackPlugin.ts

import type { Compiler, Compilation, RuntimeModule } from 'webpack';
import { ConcatSource } from 'webpack-sources';
// @ts-ignore
import JsonpChunkLoadingRuntimeModule from 'webpack/lib/web/JsonpChunkLoadingRuntimeModule';
import { RuntimeGlobals } from 'webpack';
import customJsonp from './container/custom-jsonp';

class CustomWebpackPlugin {
  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'CustomWebpackPlugin',
      (compilation: Compilation) => {
        compilation.hooks.runtimeModule.tap(
          'CustomWebpackPlugin',
          (runtimeModule: RuntimeModule, chunk) => {
            if (
              runtimeModule.constructor.name ===
                'JsonpChunkLoadingRuntimeModule' &&
              chunk.name === 'webpack'
            ) {
              const jsonpRuntimeModule =
                runtimeModule as unknown as JsonpChunkLoadingRuntimeModule;

              if (jsonpRuntimeModule) {
                const originalSource = jsonpRuntimeModule.getGeneratedCode();
                const modifiedSource = new ConcatSource(
                  originalSource,
                  '\n',
                  '// Custom code here\n',
                  customJsonp.replace(
                    '__APPNAME__',
                    //@ts-ignore
                    compiler.options.output.uniqueName
                  )
                );
                //@ts-ignore
                runtimeModule.getGeneratedCode = () => modifiedSource.source();
                // runtimeModule.source = (runtimeTemplate, moduleTemplates) =>
                //   // @ts-ignore
                //   modifiedSource;
                console.log('adding updated runtime source');
              }
            }
          }
        );
      }
    );
  }
}

export default CustomWebpackPlugin;
