/*
 * This file was automatically generated.
 * DO NOT MODIFY BY HAND.
 * Run `pnpm generate:schema -w` to update.
 */

import type { ExternalsType, Remotes } from './ModuleFederationPlugin';

export interface ContainerReferencePluginOptions {
  /**
   * Enable/disable asynchronous loading of runtime modules. When enabled, entry points will be wrapped in asynchronous chunks.
   */
  async?: boolean;
  /**
   * The external type of the remote containers.
   */
  remoteType: ExternalsType;
  remotes: Remotes;
  /**
   * The name of the share scope shared with all remotes (defaults to 'default').
   */
  shareScope?: string | string[];
}
