import type { Remote } from '../type';

const kProxyToRaw = Symbol('mf.options.remotes.proxyToRaw');

/**
 * A symbol used internally to store the raw remotes array on ModuleFederation instance.
 *
 * Note:
 * - This is internal-only and is intentionally not exported from package entrypoints.
 * - It exists to allow runtime-core internal logic to mutate remotes safely, even when
 *   `options.remotes` is proxied for userland deprecation/strict-mode enforcement.
 */
export const kRawRemotes = Symbol('mf.options.remotes.raw');

export function getRawRemotes(host: unknown): Remote[] | undefined {
  if (!host || (typeof host !== 'object' && typeof host !== 'function')) {
    return;
  }
  return (host as any)[kRawRemotes] as Remote[] | undefined;
}

export function setRawRemotes(host: unknown, rawRemotes: Remote[]): void {
  if (!host || (typeof host !== 'object' && typeof host !== 'function')) {
    return;
  }
  (host as any)[kRawRemotes] = rawRemotes;
}

export function unwrapRemotes(remotes: unknown): Remote[] {
  if (remotes && (typeof remotes === 'object' || typeof remotes === 'function')) {
    const maybeRaw = (remotes as any)[kProxyToRaw] as Remote[] | undefined;
    if (Array.isArray(maybeRaw)) {
      return maybeRaw;
    }
  }

  return (remotes as Remote[]) ?? [];
}

type IllegalMutationHandler = (action: string) => void;

const MUTATING_ARRAY_METHODS = new Set<string>([
  'copyWithin',
  'fill',
  'pop',
  'push',
  'reverse',
  'shift',
  'sort',
  'splice',
  'unshift',
]);

export function createRemotesProxy(
  rawRemotes: Remote[],
  onIllegalMutation: IllegalMutationHandler,
): Remote[] {
  const proxy = new Proxy(rawRemotes, {
    get(target, prop, receiver) {
      if (prop === kProxyToRaw) {
        return target;
      }

      const value = Reflect.get(target, prop, receiver);

      if (
        typeof prop === 'string' &&
        MUTATING_ARRAY_METHODS.has(prop) &&
        typeof value === 'function'
      ) {
        return (...args: unknown[]) => {
          onIllegalMutation(`Array.${prop}()`);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return (value as any).apply(target, args);
        };
      }

      return value;
    },

    set(target, prop, value) {
      if (prop === kProxyToRaw) {
        return Reflect.set(target, prop, value);
      }
      onIllegalMutation(`set ${String(prop)}`);
      return Reflect.set(target, prop, value);
    },

    deleteProperty(target, prop) {
      onIllegalMutation(`delete ${String(prop)}`);
      return Reflect.deleteProperty(target, prop);
    },

    defineProperty(target, prop, descriptor) {
      if (prop === kProxyToRaw) {
        return Reflect.defineProperty(target, prop, descriptor);
      }
      onIllegalMutation(`defineProperty ${String(prop)}`);
      return Reflect.defineProperty(target, prop, descriptor);
    },
  }) as Remote[];

  // Attach raw reference for internal unwrapping.
  // Note: writing this symbol is handled by the proxy `set` trap and does NOT trigger warnings.
  (proxy as any)[kProxyToRaw] = rawRemotes;

  return proxy;
}
