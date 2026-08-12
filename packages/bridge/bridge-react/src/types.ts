import * as React from 'react';

export type ErrorFallbackProps = {
  error: unknown;
  resetErrorBoundary: (...args: unknown[]) => void;
};

/**
 * Options for creating a React root
 */
export interface CreateRootOptions {
  identifierPrefix?: string;
  onRecoverableError?: (error: unknown) => void;
  transitionCallbacks?: unknown;
}

/**
 * Interface for a React root object
 */
export interface Root {
  render(children: React.ReactNode): void;
  unmount(): void;
}

/**
 * Type for a root element, which can be either an HTMLElement or a React root
 */
export type RootType = HTMLElement | Root;

/**
 * Parameters for the render function
 */
export interface RenderParams {
  moduleName?: string;
  basename?: string;
  memoryRoute?: {
    entryPath: string;
    initialState?: Record<string, unknown>;
  };
  dom: HTMLElement;
  /**
   * Options to pass to createRoot for React 18 and 19
   * @example
   * {
   *   identifierPrefix: 'app-',
   *   onRecoverableError: (err) => console.error(err)
   * }
   */
  rootOptions?: CreateRootOptions;
  [key: string]: unknown;
}

/**
 * Parameters for the destroy function
 */
export interface DestroyParams {
  moduleName: string;
  dom: HTMLElement;
}

/**
 * Parameters for the provider function
 */
export interface ProviderParams {
  moduleName?: string;
  basename?: string;
  memoryRoute?: {
    entryPath: string;
    initialState?: Record<string, unknown>;
  };
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Parameters for the render function, extending ProviderParams
 */
export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
  fallback?: React.ComponentType<{ error: Error }>;
  [key: string]: unknown;
}

/**
 * Parameters for the provider function
 */
export interface ProviderFnParams<T> {
  /**
   * The React component rendered inside the Bridge whenever the Host calls `render()`.
   *
   * ⚠️ HMR note: `rootComponent` is captured **by value** when `createBridgeComponent`
   * first runs. If you only change a *child* module (e.g. `./App.tsx`) and your exporter
   * file itself is never re-evaluated, the Bridge keeps rendering the old closed-over
   * reference. To fix this without re-writing your exporter, either:
   *
   * 1. Provide `rootComponentGetter` alongside (recommended — one-liner, works for all edits).
   * 2. Use the framework-level loader integration (`@module-federation/bridge-react-webpack-plugin`
   *    or a custom Modern.js / Rspack plugin) which automatically injects `rootComponentGetter`
   *    at compile time — see the library README for the "Zero-boilerplate HMR integration" guide.
   */
  rootComponent: React.ComponentType<T>;
  /**
   * Optional getter used by the built-in HMR runtime to always obtain the *latest*
   * `rootComponent` value — even when the exporter module itself was not re-executed
   * (which happens when a deep child import is the only file that changed).
   *
   * ### When do I need this?
   *
   * Only required for **hot-module-replacement** correctness during local development.
   * Safe to omit entirely in production / if you never rely on HMR for child component
   * edits (editing the exporter file itself still works without this field).
   *
   * ### Recommended patterns
   *
   * Default import of the root component:
   * ```ts
   * import App from './App';
   * export default createBridgeComponent({
   *   rootComponent: App,
   *   rootComponentGetter: () => (require as any)('./App').default,
   * });
   * ```
   *
   * Named import:
   * ```ts
   * import { RemoteShell } from './components/RemoteShell';
   * export default createBridgeComponent({
   *   rootComponent: RemoteShell,
   *   rootComponentGetter: () => (require as any)('./components/RemoteShell').RemoteShell,
   * });
   * ```
   *
   * If you use `paths` / tsconfig aliases (e.g. `@/App`) keep the alias string in the
   * getter as-is — Rspack/Webpack resolve the alias at runtime the same way they do at
   * the top-level `import`.
   */
  rootComponentGetter?: () => React.ComponentType<T>;
  render?: (
    App: React.ReactElement,
    id?: HTMLElement | string,
  ) => RootType | Promise<RootType>;
  createRoot?: (
    container: Element | DocumentFragment,
    options?: CreateRootOptions,
  ) => Root;
  /**
   * Default options to pass to createRoot for React 18 and 19
   * These options will be used when creating a root unless overridden by rootOptions in render params
   * @example
   * {
   *   identifierPrefix: 'app-',
   *   onRecoverableError: (err) => console.error(err)
   * }
   */
  defaultRootOptions?: CreateRootOptions;
  /**
   * Internal marker: the opaque key identifying "which caller site" created this bridge.
   * The runtime uses it to map re-executed `createBridgeComponent` calls to the latest
   * `rootComponent` when HMR replaces the exporter file. Populated automatically by
   * the version-specific entrypoints (v18 / v19 / legacy) and not expected to be
   * supplied by end users.
   */
  __callerKey?: string | symbol;
}

/**
 * Parameters for the remote component
 */
export interface RemoteComponentProps<T = Record<string, unknown>> {
  props?: T;
  fallback?: React.ComponentType<{ error: Error }>;
  loading?: React.ReactNode;
  [key: string]: unknown;
}

/**
 * Parameters for the remote component loader
 */
export interface RemoteComponentParams<
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
> {
  loader: () => Promise<T>;
  loading: React.ReactNode;
  fallback: React.ComponentType<{ error: Error }>;
  export?: E;
  props?: T;
}

/**
 * Interface for a remote module provider
 */
export interface RemoteModule {
  provider: () => {
    render: (info: RenderFnParams) => void;
    destroy: (info: { dom: any }) => void;
  };
}

/**
 * Parameters for a remote app component
 */
export interface RemoteAppParams extends ProviderParams {
  moduleName: string;
  providerInfo: NonNullable<RemoteModule['provider']>;
  exportName: string | number | symbol;
  fallback: React.ComponentType<ErrorFallbackProps>;
}
