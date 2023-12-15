import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';
import type { Compiler, Compilation } from 'webpack';
import { ModuleInfoRuntimeModule } from './ModuleInfoRuntimeModule';
const { RuntimeGlobals } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

class ModuleInfoRuntimePlugin {
  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(
      'ModuleInfoPlugin',
      (compilation: Compilation) => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'ModuleInfoRuntimeModule',
          (chunk, set) => {
            //workaround
            if (set.has('__webpack_require__.federation')) return;
            //TODO: this should be added as a handler, so one can push requirements in and we call the for tap to add module once.
            set.add('__webpack_require__.federation');

            set.add(RuntimeGlobals.global);

            set.add(RuntimeGlobals.runtimeId);
            compilation.addRuntimeModule(chunk, new ModuleInfoRuntimeModule());
          },
        );
      },
    );
  }
}

export { ModuleInfoRuntimePlugin };
