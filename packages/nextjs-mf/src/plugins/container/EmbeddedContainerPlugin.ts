import type { Compilation, Compiler, Chunk } from 'webpack';
import InvertedContainerRuntimeModule from './InvertedContainerRuntimeModule';

export interface EmbeddedContainerOptions {
  runtime: string;
  container?: string;
  chunkToEmbed: string;
}

class EmbeddedContainerPlugin {
  private options: EmbeddedContainerOptions;

  constructor(options: EmbeddedContainerOptions) {
    this.options = options;
  }

  public apply(compiler: Compiler): void {
    compiler.hooks.thisCompilation.tap(
      'EmbeddedContainerPlugin',
      (compilation: Compilation) => {
        // Adding the runtime module
        compilation.hooks.additionalTreeRuntimeRequirements.tap(
          'EmbeddedContainerPlugin',
          (chunk, set) => {
            const runtimeModuleOptions = {
              runtime: this.options.runtime,
              remotes: {},
              name: this.options.container,
              debug: false,
              container: this.options.container,
            };

            compilation.addRuntimeModule(
              chunk,
              new InvertedContainerRuntimeModule(runtimeModuleOptions),
            );
          },
        );
      },
    );
  }
}

export default EmbeddedContainerPlugin;
