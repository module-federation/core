import type { Compilation, Compiler } from 'webpack';

class InvertedContainerPlugin {
  apply(compiler: Compiler): void {
    const enhanced =
      require('@module-federation/enhanced') as typeof import('@module-federation/enhanced');
    const FederationModulesPlugin = enhanced.FederationModulesPlugin;
    const dependencies = enhanced.dependencies;
    const InvertedContainerRuntimeModule =
      require('./InvertedContainerRuntimeModule')
        .default as typeof import('./InvertedContainerRuntimeModule').default;

    compiler.hooks.thisCompilation.tap(
      'InvertedContainerPlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containers = new Set();

        hooks.addContainerEntryDependency.tap(
          'InvertedContainerPlugin',
          (dependency) => {
            if (dependency instanceof dependencies.ContainerEntryDependency) {
              containers.add(dependency);
            }
          },
        );

        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'InvertedContainerPlugin',
          (chunk) => {
            compilation.addRuntimeModule(
              chunk,
              new InvertedContainerRuntimeModule({
                containers,
              }),
            );
          },
        );
      },
    );
  }
}

export default InvertedContainerPlugin;
