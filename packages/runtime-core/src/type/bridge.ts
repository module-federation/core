export type BridgeOperationSide = 'consumer' | 'producer';

export type BridgeFramework = 'react' | 'vue';

export type BridgeOperation = 'render' | 'update' | 'destroy' | 'route-sync';

export interface BridgeRouteSummary {
  action:
    | 'basename-init'
    | 'memory-route-init'
    | 'host-to-remote'
    | 'remote-to-host'
    | 'popstate'
    | 'route-update';
  from?: string;
  to?: string;
  basename?: string;
  mechanism?: 'popstate';
}

export interface BridgeOperationContext {
  side: BridgeOperationSide;
  framework: BridgeFramework;
  operation: BridgeOperation;
  target?: object;
  moduleName?: string;
  route?: BridgeRouteSummary;
  reason?:
    | 'mount'
    | 'props-update'
    | 'keep-alive-activate'
    | 'keep-alive-deactivate'
    | 'unmount'
    | 'direct';
}

export interface BridgeOperationResult {
  context: BridgeOperationContext;
  result?: unknown;
  error?: unknown;
}
