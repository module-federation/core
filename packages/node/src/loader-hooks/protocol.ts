/**
 * Shared protocol between the main thread (registration + runtime plugin) and
 * the module-customization hooks thread spawned by `module.register()`.
 *
 * Everything in this file must stay dependency-free so it can be bundled into
 * application code (the runtime plugin) as well as loaded on the hooks thread.
 */

export const MF_NODE_LOG_PREFIX = '[@module-federation/node]';

export const MF_NATIVE_LOADER_ENV_FLAG = 'MF_NODE_NATIVE_LOADER';
export const MF_NATIVE_LOADER_HOSTS_ENV = 'MF_NODE_NATIVE_LOADER_HOSTS';

export const ADD_ORIGIN_MESSAGE = 'mf-native-http-loader:add-origin' as const;
export const ACK_MESSAGE = 'mf-native-http-loader:ack' as const;

export interface AddOriginMessage {
  id: number;
  type: typeof ADD_ORIGIN_MESSAGE;
  origin: string;
}

export interface AckMessage {
  id: number;
  type: typeof ACK_MESSAGE;
}

/**
 * Minimal structural type for the port shared with the hooks thread. Matches
 * the subset of `worker_threads.MessagePort` used by this feature so that the
 * protocol module stays free of `node:` imports.
 */
export interface LoaderMessagePort {
  postMessage(value: unknown): void;
  on(event: 'message', listener: (value: unknown) => void): unknown;
  unref?(): unknown;
  close?(): void;
}

/** Data passed to the hooks thread through `module.register()`'s initialize hook. */
export interface NativeHttpLoaderInitializeData {
  allowedOrigins: string[];
  port?: LoaderMessagePort;
}

/**
 * Main-thread state describing an active native HTTP loader registration.
 * Stored on `globalThis` so the runtime plugin (bundled into the app) and the
 * registration entry point (loaded via `--import`) can find each other without
 * sharing module instances.
 */
export interface NativeHttpLoaderState {
  /** Origins acknowledged by the hooks thread (plus statically seeded ones). */
  allowedOrigins: Set<string>;
  /**
   * Allow an origin (e.g. `https://cdn.example.com`) and wait until the hooks
   * thread has acknowledged the update, so a subsequent `import()` cannot race
   * ahead of the allowlist. Concurrent calls for the same origin share one
   * in-flight acknowledgement.
   */
  allowOrigin(origin: string): Promise<void>;
}

export const NATIVE_LOADER_GLOBAL_KEY = Symbol.for(
  '@module-federation/node:native-http-loader',
);

type GlobalWithLoaderState = typeof globalThis & {
  [NATIVE_LOADER_GLOBAL_KEY]?: NativeHttpLoaderState;
};

/**
 * Returns the active native HTTP loader state, if `registerNativeHttpLoader()`
 * (or the `@module-federation/node/register` entry point) has been executed in
 * this process. The state lives on `globalThis` so that application bundles
 * and the registration entry point do not need to share module instances.
 */
export function getNativeHttpLoaderState(): NativeHttpLoaderState | undefined {
  return (globalThis as GlobalWithLoaderState)[NATIVE_LOADER_GLOBAL_KEY];
}

export function setNativeHttpLoaderState(state: NativeHttpLoaderState): void {
  (globalThis as GlobalWithLoaderState)[NATIVE_LOADER_GLOBAL_KEY] = state;
}

/** Test-only helper: removes the global loader state. */
export function clearNativeHttpLoaderStateForTesting(): void {
  delete (globalThis as GlobalWithLoaderState)[NATIVE_LOADER_GLOBAL_KEY];
}

export function normalizeOrigin(originOrUrl: string): string {
  return new URL(originOrUrl).origin;
}

export function isHttpUrl(value: string | undefined): boolean {
  return (
    typeof value === 'string' &&
    (value.startsWith('http://') || value.startsWith('https://'))
  );
}
