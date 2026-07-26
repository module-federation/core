import type { BridgeOperationContext, BridgeOperationResult } from './type';

type BridgeLifecyclePayloads = {
  beforeBridgeOperation: BridgeOperationContext;
  bridgeRenderInvoked: BridgeOperationContext;
  afterBridgeOperation: BridgeOperationResult;
  afterBridgeCommit: BridgeOperationContext;
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

export function startBridgeOperation(
  instance: { bridgeHook?: { lifecycle?: BridgeLifecycle } } | null | undefined,
  options: Omit<BridgeOperationContext, 'operationKey'>,
) {
  const context: BridgeOperationContext = {
    ...options,
    operationKey: {},
  };
  emitBridgeLifecycle(instance, 'beforeBridgeOperation', context);
  let finished = false;

  return {
    invoked() {
      emitBridgeLifecycle(instance, 'bridgeRenderInvoked', context);
    },
    commit() {
      emitBridgeLifecycle(instance, 'afterBridgeCommit', context);
    },
    finish<T>(result: T): T {
      if (
        result &&
        typeof (result as unknown as PromiseLike<unknown>).then === 'function'
      ) {
        return Promise.resolve(result).then(
          (value) => {
            finished = true;
            emitBridgeLifecycle(instance, 'afterBridgeOperation', {
              context,
              result: value,
            });
            return value;
          },
          (error) => {
            finished = true;
            emitBridgeLifecycle(instance, 'afterBridgeOperation', {
              context,
              error,
            });
            throw error;
          },
        ) as T;
      }

      finished = true;
      emitBridgeLifecycle(instance, 'afterBridgeOperation', {
        context,
        result,
      });
      return result;
    },
    fail(error: unknown) {
      if (finished) {
        return;
      }
      finished = true;
      emitBridgeLifecycle(instance, 'afterBridgeOperation', {
        context,
        error,
      });
    },
  };
}
