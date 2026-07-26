import type { BridgeOperationContext, BridgeOperationResult } from './type';

type BridgeLifecyclePayloads = {
  afterBridgeCommit: BridgeOperationContext;
  afterBridgeRouteSync: BridgeOperationResult;
};

type BridgeLifecycle = {
  [Lifecycle in keyof BridgeLifecyclePayloads]?: {
    emit(payload: BridgeLifecyclePayloads[Lifecycle]): unknown;
  };
};

export function emitBridgeLifecycle<Lifecycle extends keyof BridgeLifecycle>(
  instance: { bridgeHook?: { lifecycle?: BridgeLifecycle } } | null | undefined,
  lifecycle: Lifecycle,
  payload: BridgeLifecyclePayloads[Lifecycle],
) {
  try {
    const hook = instance?.bridgeHook?.lifecycle?.[lifecycle] as
      | { emit(value: BridgeLifecyclePayloads[Lifecycle]): unknown }
      | undefined;
    hook?.emit(payload);
  } catch {
    // Observability signals must not affect Bridge behavior.
  }
}
