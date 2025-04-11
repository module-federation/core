import * as React from 'react';
import { ErrorBoundaryPropsWithComponent } from 'react-error-boundary';

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
  rootComponent: React.ComponentType<T>;
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
  fallback: ErrorBoundaryPropsWithComponent['FallbackComponent'];
}
