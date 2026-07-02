import { MF_NATIVE_LOADER_ENV_FLAG, isHttpUrl } from './protocol';
import { getNativeHttpLoaderState } from './state';

/**
 * Structural subset of the MF runtime's `RemoteEntryExports` /
 * `RemoteInfo` types, kept local so this module can be bundled into
 * application code without pulling runtime-core type dependencies.
 */
export interface NativeRemoteEntryExports {
  get: (id: string) => () => Promise<unknown>;
  init: (...args: unknown[]) => void | Promise<void>;
}

export interface NativeLoaderRemoteInfo {
  name: string;
  entry: string;
  type?: string;
}

const NATIVE_COMPATIBLE_REMOTE_TYPES = new Set(['module', 'esm']);

// Indirect dynamic import so bundlers (webpack/rspack) leave it untouched and
// the request flows through Node's module loader — and thus our hooks.
const dynamicImport = (url: string): Promise<Record<string, unknown>> =>
  new Function('u', 'return import(u)')(url);

function isNativeLoaderDisabledByEnv(): boolean {
  const flag = process.env[MF_NATIVE_LOADER_ENV_FLAG];
  return flag === '0' || flag === 'false';
}

function pickContainer(
  namespace: Record<string, unknown>,
): NativeRemoteEntryExports | undefined {
  const candidates = [namespace, namespace['default']];
  for (const candidate of candidates) {
    if (
      candidate &&
      typeof (candidate as NativeRemoteEntryExports).get === 'function' &&
      typeof (candidate as NativeRemoteEntryExports).init === 'function'
    ) {
      return candidate as NativeRemoteEntryExports;
    }
  }
  return undefined;
}

/**
 * Loads a remote entry through Node's native ESM loader (dynamic `import()`
 * routed through the hooks registered by `registerNativeHttpLoader`).
 *
 * Returns `undefined` when the native path does not apply — no registration,
 * disabled via env, non-HTTP entry, or a remote entry format that requires
 * the default vm-based path — so the MF runtime falls back to its default
 * entry loading.
 */
export async function loadEntryViaNativeHttpLoader(remoteInfo: {
  name: string;
  entry: string;
  type?: string;
}): Promise<NativeRemoteEntryExports | undefined> {
  const state = getNativeHttpLoaderState();
  if (!state?.enabled || isNativeLoaderDisabledByEnv()) {
    return undefined;
  }

  const { name, entry, type } = remoteInfo;
  if (!isHttpUrl(entry)) {
    return undefined;
  }
  if (!type || !NATIVE_COMPATIBLE_REMOTE_TYPES.has(type)) {
    return undefined;
  }

  await state.allowOrigin(entry);
  const namespace = await dynamicImport(entry);
  const container = pickContainer(namespace);

  if (!container) {
    throw new Error(
      `[@module-federation/node] Remote "${name}" was imported from "${entry}" via the ` +
        `native HTTP loader but does not expose a federation container ` +
        `(expected "get" and "init" exports). Check that the remote is built ` +
        `with library.type "module".`,
    );
  }

  return container;
}
