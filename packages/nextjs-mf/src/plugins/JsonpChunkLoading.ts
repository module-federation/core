// CustomWebpackPlugin.ts
import type { Chunk, Compilation, Compiler, RuntimeModule } from 'webpack';
import { ConcatSource } from 'webpack-sources';
//@ts-ignore
import JsonpChunkLoadingRuntimeModule from 'webpack/lib/web/JsonpChunkLoadingRuntimeModule';
import Template from '../../utils/Template';
import template from './container/custom-jsonp';

/**
 * Generates custom JSONP code.
 * @param {string} chunkLoadingGlobal - The global variable for chunk loading.
 * @param {any} RuntimeGlobals - The runtime globals.
 * @returns {string} - The generated code.
 */
function getCustomJsonpCode(
  chunkLoadingGlobal: string,
  RuntimeGlobals: any,
): string {
  const code = [
    'var chunkQueue = [];',
    'var chunkTracker = [];',
    `var chunkLoadingGlobal = self[${JSON.stringify(
      chunkLoadingGlobal,
    )}] || [];`,
    'var asyncQueue = [];',
    template,
  ];
  return Template.asString(code);
}

/**
 * CustomWebpackPlugin class.
 */
class CustomWebpackPlugin {
  private options: any;

  /**
   * Constructor for the CustomWebpackPlugin class.
   * @param {any} options - The options for the plugin.
   */
  constructor(options: any = {}) {
    this.options = options;
  }

  /**
   * Applies the plugin to the compiler.
   * @param {Compiler} compiler - The webpack compiler.
   */
  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'CustomWebpackPlugin',
      (compilation: Compilation) => {
        compilation.hooks.runtimeModule.tap(
          'CustomWebpackPlugin',
          (runtimeModule: RuntimeModule, chunk: Chunk) => {
            if (this.options.server && chunk.name === 'webpack-runtime') {
              // if server runtime module
            }

            if (
              runtimeModule instanceof JsonpChunkLoadingRuntimeModule &&
              chunk.name === 'webpack'
            ) {
              const originalSource = runtimeModule.getGeneratedCode();
              if (!originalSource) {
                return;
              }

              const modifiedSource = new ConcatSource(
                originalSource,
                '\n',
                getCustomJsonpCode(
                  //@ts-ignore
                  compilation.outputOptions.chunkLoadingGlobal,
                  compiler.webpack.RuntimeGlobals,
                ),
              );
              runtimeModule.getGeneratedCode = () => modifiedSource.source();
            }
          },
        );
      },
    );
  }
}

export default CustomWebpackPlugin;
