import type { Compiler, WebpackPluginInstance } from 'webpack';

export class AddRuntimeRequirementToPromiseExternal implements WebpackPluginInstance {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(
      'AddRuntimeRequirementToPromiseExternal',
      (compilation) => {
        // Skip compilations inherited by child compilers (worker-loader, html-webpack-plugin, ...);
        // mirrors isInheritedChildCompilation in @module-federation/enhanced.
        if (compilation.compiler !== compiler) return;
        const { RuntimeGlobals } = compiler.webpack;
        compilation.hooks.additionalModuleRuntimeRequirements.tap(
          'AddRuntimeRequirementToPromiseExternal',
          (module, set) => {
            if ((module as any).externalType === 'promise') {
              set.add(RuntimeGlobals.loadScript);
              set.add(RuntimeGlobals.require);
            }
          },
        );
      },
    );
  }
}

export default AddRuntimeRequirementToPromiseExternal;
