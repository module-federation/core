import type { CSSProperties } from 'react';

export interface ProviderParams {
  moduleName?: string;
  basename?: string;
  memoryRoute?: { entryPath: string };
  hashRoute?: boolean;
  style?: CSSProperties;
  className?: string;
}

export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
}

export type BridgeOperationSide = 'consumer' | 'producer';

export type BridgeFramework = 'react' | 'vue';

export type BridgeOperation = 'render' | 'update' | 'destroy' | 'route-sync';

export interface BridgeRouteSummary {
  action: 'memory-route-init' | 'host-to-remote';
  from?: string;
  to?: string;
  basename?: string;
  mechanism?: 'popstate';
}

export interface BridgeOperationContext {
  side: BridgeOperationSide;
  framework: BridgeFramework;
  operation: BridgeOperation;
  moduleName?: string;
  route?: BridgeRouteSummary;
  reason?: 'unmount' | 'direct';
}

export interface BridgeOperationResult {
  context: BridgeOperationContext;
  result?: unknown;
}
