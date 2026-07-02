import { NATIVE_LOADER_GLOBAL_KEY } from './protocol';
import type { NativeHttpLoaderState } from './protocol';

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
