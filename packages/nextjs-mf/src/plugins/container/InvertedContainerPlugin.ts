import type { Compiler } from 'webpack';
import { ModuleFederationPluginOptions } from './types';
import EmbeddedContainerPlugin from './EmbeddedContainerPlugin';
import { AsyncBoundaryPlugin } from '@module-federation/enhanced';

interface InvertedContainerOptions extends ModuleFederationPluginOptions {
  container?: string;
  remotes: Record<string, string>;
  runtime: string;
  debug?: boolean;
  chunkToEmbed: string;
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
      chunkToEmbed: this.options.chunkToEmbed,
    }).apply(compiler);

    new AsyncBoundaryPlugin({
      eager: (module) => /.federation/.test(module.identifier())
      //@ts-ignore
    }).apply(compiler);
  }
}

export default InvertedContainerPlugin;

