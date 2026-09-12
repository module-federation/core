export interface RecordedRemoteSideEffects {
  timers: Set<NodeJS.Timeout | number>;
  immediates: Set<NodeJS.Immediate | number>;
  listeners: Array<{
    emitter: NodeJS.EventEmitter;
    event: string | symbol;
    listener: (...args: any[]) => void;
  }>;
}

interface SideEffectScopeState {
  depth: number;
  stack: string[];
  registry: Map<string, RecordedRemoteSideEffects>;
  originalSetTimeout?: typeof setTimeout;
  originalSetInterval?: typeof setInterval;
  originalSetImmediate?: typeof setImmediate;
  originalProcessOn?: typeof process.on;
  originalProcessOnce?: typeof process.once;
  originalProcessAddListener?: typeof process.addListener;
  originalProcessPrependListener?: typeof process.prependListener;
  originalProcessPrependOnceListener?: typeof process.prependOnceListener;
}

const REMOTE_SIDE_EFFECT_POLICY = Symbol.for(
  '@module-federation/remote-side-effect-policy',
);

function getSideEffectState(): SideEffectScopeState {
  return ((globalThis as any)[REMOTE_SIDE_EFFECT_POLICY] ??= {
    depth: 0,
    stack: [],
    registry: new Map(),
  });
}

function getOrCreateBucket(
  state: SideEffectScopeState,
  scopeId: string,
): RecordedRemoteSideEffects {
  let bucket = state.registry.get(scopeId);
  if (!bucket) {
    bucket = {
      timers: new Set(),
      immediates: new Set(),
      listeners: [],
    };
    state.registry.set(scopeId, bucket);
  }
  return bucket;
}

function installPatches(state: SideEffectScopeState): void {
  const g = globalThis as any;
  state.originalSetTimeout = g.setTimeout;
  state.originalSetInterval = g.setInterval;
  state.originalSetImmediate = g.setImmediate;

  g.setTimeout = function (
    handler: TimerHandler,
    timeout?: number,
    ...args: any[]
  ) {
    const handle = state.originalSetTimeout!.call(g, handler, timeout, ...args);
    const activeScope = state.stack[state.stack.length - 1];
    if (activeScope) {
      const bucket = getOrCreateBucket(state, activeScope);
      bucket.timers.add(handle);
    }
    return handle;
  };

  g.setInterval = function (
    handler: TimerHandler,
    timeout?: number,
    ...args: any[]
  ) {
    const handle = state.originalSetInterval!.call(
      g,
      handler,
      timeout,
      ...args,
    );
    const activeScope = state.stack[state.stack.length - 1];
    if (activeScope) {
      const bucket = getOrCreateBucket(state, activeScope);
      bucket.timers.add(handle);
    }
    return handle;
  };

  if (typeof state.originalSetImmediate === 'function') {
    g.setImmediate = function (
      handler: (...args: any[]) => void,
      ...args: any[]
    ) {
      const handle = state.originalSetImmediate!.call(g, handler, ...args);
      const activeScope = state.stack[state.stack.length - 1];
      if (activeScope) {
        const bucket = getOrCreateBucket(state, activeScope);
        bucket.immediates.add(handle);
      }
      return handle;
    };
  }

  const proc = g.process;
  if (proc && typeof proc.on === 'function') {
    state.originalProcessOn = proc.on;
    state.originalProcessOnce = proc.once;
    state.originalProcessAddListener = proc.addListener;
    state.originalProcessPrependListener = proc.prependListener;
    state.originalProcessPrependOnceListener = proc.prependOnceListener;

    const recordListener = (
      event: string | symbol,
      listener: (...args: any[]) => void,
    ) => {
      const activeScope = state.stack[state.stack.length - 1];
      if (activeScope) {
        const bucket = getOrCreateBucket(state, activeScope);
        bucket.listeners.push({ emitter: proc, event, listener });
      }
    };

    proc.on = function (
      event: string | symbol,
      listener: (...args: any[]) => void,
    ) {
      recordListener(event, listener);
      return state.originalProcessOn!.call(proc, event, listener);
    };

    proc.addListener = function (
      event: string | symbol,
      listener: (...args: any[]) => void,
    ) {
      recordListener(event, listener);
      return state.originalProcessAddListener!.call(proc, event, listener);
    };

    proc.once = function (
      event: string | symbol,
      listener: (...args: any[]) => void,
    ) {
      recordListener(event, listener);
      return state.originalProcessOnce!.call(proc, event, listener);
    };

    if (typeof state.originalProcessPrependListener === 'function') {
      proc.prependListener = function (
        event: string | symbol,
        listener: (...args: any[]) => void,
      ) {
        recordListener(event, listener);
        return state.originalProcessPrependListener!.call(
          proc,
          event,
          listener,
        );
      };
    }

    if (typeof state.originalProcessPrependOnceListener === 'function') {
      proc.prependOnceListener = function (
        event: string | symbol,
        listener: (...args: any[]) => void,
      ) {
        recordListener(event, listener);
        return state.originalProcessPrependOnceListener!.call(
          proc,
          event,
          listener,
        );
      };
    }
  }
}

function restorePatches(state: SideEffectScopeState): void {
  const g = globalThis as any;
  if (state.originalSetTimeout) {
    g.setTimeout = state.originalSetTimeout;
    state.originalSetTimeout = undefined;
  }
  if (state.originalSetInterval) {
    g.setInterval = state.originalSetInterval;
    state.originalSetInterval = undefined;
  }
  if (state.originalSetImmediate) {
    g.setImmediate = state.originalSetImmediate;
    state.originalSetImmediate = undefined;
  }

  const proc = g.process;
  if (proc) {
    if (state.originalProcessOn) {
      proc.on = state.originalProcessOn;
      state.originalProcessOn = undefined;
    }
    if (state.originalProcessOnce) {
      proc.once = state.originalProcessOnce;
      state.originalProcessOnce = undefined;
    }
    if (state.originalProcessAddListener) {
      proc.addListener = state.originalProcessAddListener;
      state.originalProcessAddListener = undefined;
    }
    if (state.originalProcessPrependListener) {
      proc.prependListener = state.originalProcessPrependListener;
      state.originalProcessPrependListener = undefined;
    }
    if (state.originalProcessPrependOnceListener) {
      proc.prependOnceListener = state.originalProcessPrependOnceListener;
      state.originalProcessPrependOnceListener = undefined;
    }
  }
}

/**
 * Runs a synchronous evaluation under a named side-effect scope.
 * While `fn` executes, any top-level timers (setTimeout, setInterval, setImmediate)
 * and process listeners (process.on, process.once) registered on the current thread
 * are attributed to `scopeId`.
 *
 * When the scope exits, the original global methods are restored immediately.
 * Nested scopes (e.g. Remote A synchronously requiring Remote B) maintain an
 * explicit stack where each registration is attributed to the innermost active scope.
 */
export function withSideEffectScope<T>(scopeId: string, fn: () => T): T {
  if (!scopeId || typeof globalThis === 'undefined') {
    return fn();
  }

  const state = getSideEffectState();
  if (state.depth === 0) {
    installPatches(state);
  }
  state.stack.push(scopeId);
  state.depth++;

  try {
    return fn();
  } finally {
    state.stack.pop();
    state.depth--;
    if (state.depth === 0) {
      restorePatches(state);
    }
  }
}

/**
 * Cancels all timers and removes all process listeners recorded for `scopeId`.
 * Returns the number of disposed effects.
 */
export function disposeRemoteSideEffects(scopeId: string): number {
  const state = getSideEffectState();
  const bucket = state.registry.get(scopeId);
  if (!bucket) {
    return 0;
  }

  let disposed = 0;
  for (const timer of bucket.timers) {
    try {
      clearTimeout(timer as any);
      clearInterval(timer as any);
      if (typeof (timer as any)?.unref === 'function') {
        (timer as any).unref();
      }
      disposed++;
    } catch {
      // ignore
    }
  }

  for (const immediate of bucket.immediates) {
    try {
      clearImmediate(immediate as any);
      disposed++;
    } catch {
      // ignore
    }
  }

  for (const { emitter, event, listener } of bucket.listeners) {
    try {
      if (typeof emitter?.removeListener === 'function') {
        emitter.removeListener(event, listener);
        disposed++;
      }
    } catch {
      // ignore
    }
  }

  state.registry.delete(scopeId);
  return disposed;
}

export function getRecordedRemoteSideEffects(
  scopeId: string,
): RecordedRemoteSideEffects | undefined {
  const state = getSideEffectState();
  return state.registry.get(scopeId);
}

export function resetRemoteSideEffectsState(): void {
  const state = getSideEffectState();
  if (state.depth > 0) {
    restorePatches(state);
  }
  state.depth = 0;
  state.stack = [];
  state.registry.clear();
}
