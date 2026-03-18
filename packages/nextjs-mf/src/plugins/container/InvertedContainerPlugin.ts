import type { Compilation, Compiler, Chunk } from 'webpack';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';

type EnhancedModuleExports = typeof import('@module-federation/enhanced');

const loadEnhanced = (): EnhancedModuleExports => {
  const enhancedModule = require('@module-federation/enhanced') as
    | EnhancedModuleExports
    | { default: EnhancedModuleExports };

  return (enhancedModule as { default?: EnhancedModuleExports }).default
    ? (enhancedModule as { default: EnhancedModuleExports }).default
    : (enhancedModule as EnhancedModuleExports);
};

class InvertedContainerPlugin {
  public apply(compiler: Compiler): void {
    const { FederationModulesPlugin, dependencies } = loadEnhanced();

    compiler.hooks.thisCompilation.tap(
      'EmbeddedContainerPlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containers = new Set();
        hooks.addContainerEntryDependency.tap(
          'EmbeddedContainerPlugin',
          (dependency) => {
            if (dependency instanceof dependencies.ContainerEntryDependency) {
              containers.add(dependency);
            }
          },
        );
        // Adding the runtime module
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'EmbeddedContainerPlugin',
          (chunk, set) => {
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
