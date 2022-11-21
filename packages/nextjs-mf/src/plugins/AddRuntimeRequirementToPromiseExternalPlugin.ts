import { Compiler, RuntimeGlobals } from 'webpack';

export class AddRuntimeRequirementToPromiseExternal {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      'AddRuntimeRequirementToPromiseExternal',
      (compilation) => {
        compilation.hooks.additionalModuleRuntimeRequirements.tap(
          'AddRuntimeRequirementToPromiseExternal',
          (module, set) => {
            if ((module as any).externalType === 'promise') {
              set.add(RuntimeGlobals.loadScript);
              set.add(RuntimeGlobals.require);
            }
          }
        );
      }
    );
  }
}

export default AddRuntimeRequirementToPromiseExternal;
