import type { Compiler } from 'webpack';
import EmbeddedContainerPlugin from './EmbeddedContainerPlugin';
import { AsyncBoundaryPlugin } from '@module-federation/enhanced';

interface InvertedContainerOptions {
  container?: string;
  remotes: Record<string, string>;
  runtime: string;
  debug?: boolean;
}

class InvertedContainerPlugin {
  private options: InvertedContainerOptions;

  constructor(options: InvertedContainerOptions) {
    this.options = options;
  }

  public apply(compiler: Compiler): void {
    new EmbeddedContainerPlugin({
      runtime: this.options.runtime,
      container: this.options.container,
    }).apply(compiler);

    new AsyncBoundaryPlugin({
      excludeChunk: (chunk) =>
        chunk.name === this.options.container ||
        chunk.name === this.options.container + '_partial',
      // @ts-ignore
      eager: (module) => /\.federation/.test(module?.request || ''),
    }).apply(compiler);
  }
}

export default InvertedContainerPlugin;
