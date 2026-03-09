import type { Shared } from './ModuleFederationPlugin';

/**
 * Options for shared modules.
 */
export interface SharePluginOptions {
  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string | string[];
  /**
   * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
   */
  shared: Shared;
}
export declare class SharePlugin {
  constructor(options: SharePluginOptions);

  /**
   * Apply the plugin
   */
  apply(compiler: any): void;
}
