/**
 * Mock type definitions for @module-federation/runtime-core
 * Based on usage patterns in the examples
 */

export interface RemoteConfig {
  name: string;
  entry: string;
}

export interface SharedConfig {
  [packageName: string]: {
    singleton?: boolean;
    eager?: boolean;
    requiredVersion?: string;
  };
}

export interface ModuleFederationConfig {
  name: string;
  remotes?: RemoteConfig[];
  shared?: SharedConfig;
  plugins?: any[]; // Plugin type is unclear from examples
}

export interface ModuleFederationInstance {
  loadRemote(id: string): Promise<any>;
  preloadRemote?(remotes: Array<{ nameOrAlias: string }>): Promise<void>;
  moduleCache?: Map<string, any>;
  shareScopeMap?: Record<string, any>;
  registerPlugin?(plugin: any): void;
}

export class ModuleFederation implements ModuleFederationInstance {
  constructor(config: ModuleFederationConfig);
  loadRemote(id: string): Promise<any>;
  preloadRemote?(remotes: Array<{ nameOrAlias: string }>): Promise<void>;
  moduleCache?: Map<string, any>;
  shareScopeMap?: Record<string, any>;
  registerPlugin?(plugin: any): void;
}