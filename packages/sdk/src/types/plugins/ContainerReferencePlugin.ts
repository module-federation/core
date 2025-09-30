import type { ExternalsType, Remotes } from './ModuleFederationPlugin';

export interface ContainerReferencePluginOptions {
  /**
   * The external type of the remote containers.
   */
  remoteType: ExternalsType;
  /**
   * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
   */
  remotes: Remotes;
  /**
   * The name of the share scope shared with all remotes (defaults to 'default').
   */
  shareScope?: string | string[];
}
