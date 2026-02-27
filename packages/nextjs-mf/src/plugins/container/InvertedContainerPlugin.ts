import type { Compilation, Compiler, Chunk } from 'webpack';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';
import enhanced from '@module-federation/enhanced';

const enhancedExports = (enhanced as any).default || enhanced;
const { FederationModulesPlugin, dependencies } = enhancedExports;

class InvertedContainerPlugin {
  public apply(compiler: Compiler): void {
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
