/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `pnpm generate:schema -w` to update.
 */

import type { Shared } from './ModuleFederationPlugin';

export interface SharePluginOptions {
  /**
   * Enable/disable asynchronous loading of runtime modules. When enabled, entry points will be wrapped in asynchronous chunks.
   */
  async?: boolean;
  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string | string[];
  shared: Shared;
  /**
   * Experimental features configuration
   */
  experiments?: {
    /** Enable reconstructed lookup for node_modules paths */
    allowNodeModulesSuffixMatch?: boolean;
  };
}
