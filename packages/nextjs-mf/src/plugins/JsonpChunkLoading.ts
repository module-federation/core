// CustomWebpackPlugin.ts
import type {
  Chunk,
  Compilation,
  Compiler,
  Module,
  RuntimeModule,
} from 'webpack';
import { ConcatSource } from 'webpack-sources';
// @ts-ignore
import JsonpChunkLoadingRuntimeModule from 'webpack/lib/web/JsonpChunkLoadingRuntimeModule';
import Template from '../../utils/Template';
import { DEFAULT_SHARE_SCOPE_BROWSER } from '../internal';
// import { loadDependenciesTemplate } from './LoadDependenciesTemplate';
import template from './container/custom-jsonp';

//might be usefule later
// compilation.hooks.optimizeChunks.tap(
//   'AddModulesToRuntimeChunkPlugin',
//   (chunks) => {
//     for (const chunk of chunks) {
//       const modules =
//         compilation.chunkGraph.getChunkModulesIterable(chunk);
//       // just use module type provide-module to find shared modules.
//       for (const m of modules) {
//         const foundTrueShare = Array.from(this.initialModules).some(
//           //@ts-ignore
//           (mod) => mod?.options?.importResolved === m?.resource
//         );
//         if (foundTrueShare) {
//           this.initialModulesResolved.set(
//             //@ts-ignore
//             m.resource,
//             //@ts-ignore
//             m?.resourceResolveData?.descriptionFileData
//           );
//         }
//       }
//     }
//   }
// );
function getCustomJsonpCode(
  chunkLoadingGlobal: string,
  RuntimeGlobals: any
): string {
  const code = [
    'var chunkQueue = [];',
    'var resport = [];',
    `var chunkLoadingGlobal = self[${JSON.stringify(
      chunkLoadingGlobal
    )}] || [];`,
    'var asyncQueue = [];',
    template,
  ];
  return Template.asString(code);
}

class CustomWebpackPlugin {
  private options: any;

  constructor(options?: any) {
    this.options = options || {};
  }

  apply(compiler: Compiler): void {
    compiler.hooks.compilation.tap(
      'CustomWebpackPlugin',
      (compilation: Compilation) => {
        compilation.hooks.runtimeModule.tap(
          'CustomWebpackPlugin',
          (runtimeModule: RuntimeModule, chunk: any) => {
            if (this.options.server && chunk.name === 'webpack-runtime') {
              // if server runtime module
            }

            if (
              runtimeModule.constructor.name ===
                'JsonpChunkLoadingRuntimeModule' &&
              chunk.name === 'webpack'
            ) {
              const originalSource = runtimeModule.getGeneratedCode();
              const modifiedSource = new ConcatSource(
                originalSource,
                '\n',
                getCustomJsonpCode(
                  //@ts-ignore
                  compilation.outputOptions.chunkLoadingGlobal,
                  compiler.webpack.RuntimeGlobals
                )
              );
              runtimeModule.getGeneratedCode = () => modifiedSource.source();
            }
          }
        );
      }
    );
  }
}

export default CustomWebpackPlugin;
