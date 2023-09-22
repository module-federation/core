import webpack, { Compilation, RuntimeGlobals } from 'webpack';
import ModuleInfoRuntimeModule from './ModuleInfoRuntimeModule';

class ModuleInfoPlugin {
  apply(compiler: webpack.Compiler) {
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

export default ModuleInfoPlugin;
