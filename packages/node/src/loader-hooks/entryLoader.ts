import {
  MF_NODE_LOG_PREFIX,
  getNativeHttpLoaderState,
  isHttpUrl,
} from './protocol';
import type { RemoteEntryExports } from '@module-federation/runtime/types';

const NATIVE_COMPATIBLE_REMOTE_TYPES = new Set(['module', 'esm']);

// Indirect dynamic import so bundlers (webpack/rspack) leave it untouched and
// the request flows through Node's module loader — and thus our hooks.
// Known limitation: this breaks under `--disallow-code-generation-from-strings`
// (new Function is code generation from a string); there is no bundler-proof
// alternative today.
const dynamicImport = (url: string): Promise<Record<string, unknown>> =>
  new Function('u', 'return import(u)')(url);

function pickContainer(
  namespace: Record<string, unknown>,
): RemoteEntryExports | undefined {
  const candidates = [namespace, namespace['default']];
  for (const candidate of candidates) {
    if (
      candidate &&
      typeof (candidate as RemoteEntryExports).get === 'function' &&
      typeof (candidate as RemoteEntryExports).init === 'function'
    ) {
      return candidate as RemoteEntryExports;
    }
  }
  return undefined;
}

/**
 * Loads a remote entry through Node's native ESM loader (dynamic `import()`
 * routed through the hooks registered by `registerNativeHttpLoader`).
 *
 * Returns `undefined` when the native path does not apply — no registration,
 * non-HTTP entry, or a remote entry format that requires the default vm-based
 * path — so the MF runtime falls back to its default entry loading.
 */
export async function loadEntryViaNativeHttpLoader(remoteInfo: {
  name: string;
  entry: string;
  type?: string;
}): Promise<RemoteEntryExports | undefined> {
  const state = getNativeHttpLoaderState();
  if (!state) {
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
      `${MF_NODE_LOG_PREFIX} Remote "${name}" was imported from "${entry}" via the ` +
        `native HTTP loader but does not expose a federation container ` +
        `(expected "get" and "init" exports). Check that the remote is built ` +
        `with library.type "module".`,
    );
  }

  return container;
}
