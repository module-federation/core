import { Compilation, RuntimeGlobals, Compiler } from 'webpack';
import {ModuleInfoRuntimeModule} from './ModuleInfoRuntimeModule';

class ModuleInfoRuntimePlugin {
  apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(
      'ModuleInfoPlugin',
      (compilation: Compilation) => {
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'ModuleInfoRuntimeModule',
          (chunk, set) => {
            set.add(RuntimeGlobals.global);
            compilation.addRuntimeModule(chunk, new ModuleInfoRuntimeModule());
          },
        );
      },
    );
  }
}

export { ModuleInfoRuntimePlugin };
