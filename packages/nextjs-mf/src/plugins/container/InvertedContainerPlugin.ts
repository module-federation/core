import type { Compiler } from 'webpack';
import { ModuleFederationPluginOptions } from './types';
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
      // @ts-ignore
      eager: (module) => /\.federation/.test(module?.request || ''),
      //@ts-ignore
    }).apply(compiler);
  }
}

export default InvertedContainerPlugin;
