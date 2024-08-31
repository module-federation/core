import type { Compiler } from 'webpack';
import EmbeddedContainerPlugin from './EmbeddedContainerPlugin';

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
  }
}
export default InvertedContainerPlugin;
