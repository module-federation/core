export type BridgeOperationSide = 'consumer' | 'producer';

export type BridgeFramework = 'react' | 'vue';

export type BridgeOperation = 'render' | 'update' | 'destroy' | 'route-sync';

export type BridgeOperationOutcome = 'success' | 'error' | 'skipped';

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
  operationId: string;
  bridgeId: string;
  side: BridgeOperationSide;
  framework: BridgeFramework;
  operation: BridgeOperation;
  moduleName?: string;
  remote?: string;
  expose?: string;
  route?: BridgeRouteSummary;
  reason?:
    | 'mount'
    | 'props-update'
    | 'keep-alive-activate'
    | 'keep-alive-deactivate'
    | 'unmount'
    | 'direct';
  startedAt: number;
}

export interface BridgeOperationResult extends BridgeOperationContext {
  endedAt: number;
  duration: number;
  outcome: BridgeOperationOutcome;
  error?: {
    name?: string;
    message?: string;
  };
}
