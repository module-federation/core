import type { ModuleFederation } from '../core';

/** Notify resource owners without imposing an instance teardown policy. */
export async function notifyDispose(origin: ModuleFederation): Promise<void> {
  const listeners = [...origin.hooks.lifecycle.dispose.listeners];
  const results = await Promise.allSettled(
    listeners.map((listener) =>
      Promise.resolve().then(() => listener({ origin })),
    ),
  );
  const failures = results.filter((result) => result.status === 'rejected');
  if (failures.length) {
    throw new AggregateError(
      failures.map((result) => result.reason),
      'MF disposal notification failed',
    );
  }
}
