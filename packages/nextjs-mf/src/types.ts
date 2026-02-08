import type { moduleFederationPlugin } from '@module-federation/sdk';

export type NextFederationMode = 'pages' | 'app' | 'hybrid';

export type FederationRemotes =
  moduleFederationPlugin.ModuleFederationPluginOptions['remotes'];

export interface NextFederationCompilerContext {
  isServer: boolean;
  nextRuntime?: 'nodejs' | 'edge';
  compilerName?: string;
}

export type NextFederationRemotesResolver = (
  context: NextFederationCompilerContext,
) => FederationRemotes;

export interface NextFederationOptionsV9
  extends Omit<
    moduleFederationPlugin.ModuleFederationPluginOptions,
    'remotes' | 'runtime'
  > {
  filename?: string;
  mode?: NextFederationMode;
  remotes?: FederationRemotes | NextFederationRemotesResolver;
  pages?: {
    exposePages?: boolean;
    pageMapFormat?: 'legacy' | 'routes-v2';
  };
  app?: {
    enableClientComponents?: boolean;
    enableRsc?: boolean;
  };
  runtime?: {
    environment?: 'node';
    onRemoteFailure?: 'error' | 'null-fallback';
    runtimePlugins?: (string | [string, Record<string, unknown>])[];
  };
  sharing?: {
    includeNextInternals?: boolean;
    strategy?: 'loaded-first' | 'version-first';
  };
  diagnostics?: {
    level?: 'error' | 'warn' | 'info' | 'debug';
  };
}

export interface ResolvedNextFederationOptions {
  mode: NextFederationMode;
  filename: string;
  pages: {
    exposePages: boolean;
    pageMapFormat: 'legacy' | 'routes-v2';
  };
  app: {
    enableClientComponents: boolean;
    enableRsc: boolean;
  };
  runtime: {
    environment: 'node';
    onRemoteFailure: 'error' | 'null-fallback';
    runtimePlugins: (string | [string, Record<string, unknown>])[];
  };
  sharing: {
    includeNextInternals: boolean;
    strategy: 'loaded-first' | 'version-first';
  };
  diagnostics: {
    level: 'error' | 'warn' | 'info' | 'debug';
  };
  federation: moduleFederationPlugin.ModuleFederationPluginOptions;
  remotesResolver?: NextFederationRemotesResolver;
}

export interface RouterPresence {
  hasPages: boolean;
  hasApp: boolean;
}
