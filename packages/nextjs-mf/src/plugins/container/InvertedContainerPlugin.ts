import type { Compilation, Compiler, Chunk } from 'webpack';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';
import {
  FederationModulesPlugin,
  dependencies,
} from '@module-federation/enhanced';

class InvertedContainerPlugin {
  public apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'EmbeddedContainerPlugin',
      (compilation: Compilation) => {
        const hooks = FederationModulesPlugin.getCompilationHooks(compilation);
        const containers = new Set();
        hooks.addContainerEntryModule.tap(
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
