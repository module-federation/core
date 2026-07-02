/**
 * Node.js module-customization hooks (https://nodejs.org/api/module.html#customization-hooks)
 * implementing an HTTP(S) ESM loader for Module Federation remotes.
 *
 * This module is loaded by `module.register()` and therefore runs on a
 * dedicated hooks thread, isolated from application code. It only permits
 * network imports for origins that were explicitly allowed — either statically
 * through `initialize()` data or dynamically via messages posted by the main
 * thread (see `protocol.ts`).
 */

import { isBuiltin } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  ACK_MESSAGE,
  ADD_ORIGIN_MESSAGE,
  isHttpUrl,
  normalizeOrigin,
} from './protocol';
import type {
  AddOriginMessage,
  NativeHttpLoaderInitializeData,
} from './protocol';

interface ResolveContext {
  conditions: string[];
  importAttributes: Record<string, string>;
  parentURL?: string;
}

interface ResolveResult {
  url: string;
  format?: string | null;
  importAttributes?: Record<string, string>;
  shortCircuit?: boolean;
}

interface LoadContext {
  conditions: string[];
  format?: string | null;
  importAttributes: Record<string, string>;
}

interface LoadResult {
  format: string;
  source?: string | ArrayBuffer | Uint8Array;
  shortCircuit?: boolean;
}

type NextResolve = (
  specifier: string,
  context?: ResolveContext,
) => ResolveResult | Promise<ResolveResult>;

type NextLoad = (
  url: string,
  context?: LoadContext,
) => LoadResult | Promise<LoadResult>;

interface FetchedModule {
  source: string;
  contentType: string | null;
}

const allowedOrigins = new Set<string>();
const sourceCache = new Map<string, Promise<FetchedModule>>();

export function isOriginAllowed(url: string): boolean {
  try {
    return allowedOrigins.has(normalizeOrigin(url));
  } catch {
    return false;
  }
}

function assertAllowed(url: string): void {
  if (!isOriginAllowed(url)) {
    throw new Error(
      `[@module-federation/node] Refusing to load "${url}": its origin is not in the ` +
        `native HTTP loader allowlist (${
          allowedOrigins.size ? Array.from(allowedOrigins).join(', ') : 'empty'
        }). Origins are allowed automatically for registered Module Federation ` +
        `remotes, or can be provided via the MF_NODE_NATIVE_LOADER_HOSTS ` +
        `environment variable.`,
    );
  }
}

function inferFormat(url: string, contentType: string | null): string {
  if (contentType) {
    const essence = contentType.split(';')[0].trim().toLowerCase();
    if (essence === 'application/json') {
      return 'json';
    }
    if (essence === 'application/wasm') {
      return 'wasm';
    }
  }
  const pathname = new URL(url).pathname;
  if (pathname.endsWith('.json')) {
    return 'json';
  }
  if (pathname.endsWith('.wasm')) {
    return 'wasm';
  }
  // Module Federation remote entries served over HTTP through this loader are
  // ESM builds (`library.type: 'module'`); chunks they import are ESM too.
  return 'module';
}

async function fetchSource(url: string): Promise<FetchedModule> {
  const cached = sourceCache.get(url);
  if (cached) {
    return cached;
  }
  const promise = fetch(url).then(async (response) => {
    if (!response.ok) {
      throw new Error(
        `[@module-federation/node] Failed to fetch "${url}": HTTP ${response.status} ${response.statusText}`,
      );
    }
    return {
      source: await response.text(),
      contentType: response.headers.get('content-type'),
    };
  });
  promise.catch(() => {
    // Allow retries after network failures instead of caching the rejection.
    sourceCache.delete(url);
  });
  sourceCache.set(url, promise);
  return promise;
}

/**
 * Base URL used to resolve bare specifiers imported by remote (http) modules.
 * Bare imports are resolved against the host application's node_modules so
 * that externalized/shared dependencies of a remote resolve on the host.
 */
export function hostFallbackParentURL(): string {
  return pathToFileURL(join(process.cwd(), '__mf_native_loader_host__.js'))
    .href;
}

export function initialize(data?: NativeHttpLoaderInitializeData): void {
  for (const origin of data?.allowedOrigins ?? []) {
    try {
      allowedOrigins.add(normalizeOrigin(origin));
    } catch {
      // Ignore malformed origins rather than crashing the hooks thread.
    }
  }

  const port = data?.port;
  if (port) {
    port.on('message', (message: unknown) => {
      const msg = message as AddOriginMessage;
      if (msg && msg.type === ADD_ORIGIN_MESSAGE) {
        try {
          allowedOrigins.add(normalizeOrigin(msg.origin));
        } catch {
          // Malformed origin — still ack so the main thread does not hang.
        }
        port.postMessage({ id: msg.id, type: ACK_MESSAGE });
      }
    });
    port.unref?.();
  }
}

export async function resolve(
  specifier: string,
  context: ResolveContext,
  nextResolve: NextResolve,
): Promise<ResolveResult> {
  const { parentURL } = context;

  if (isHttpUrl(specifier)) {
    assertAllowed(specifier);
    return { url: specifier, shortCircuit: true };
  }

  if (parentURL && isHttpUrl(parentURL)) {
    if (isBuiltin(specifier)) {
      return nextResolve(specifier, context);
    }

    if (
      specifier.startsWith('./') ||
      specifier.startsWith('../') ||
      specifier.startsWith('/')
    ) {
      const url = new URL(specifier, parentURL).href;
      assertAllowed(url);
      return { url, shortCircuit: true };
    }

    // Bare specifier imported by a remote module: resolve it against the host
    // application so shared/externalized dependencies come from local
    // node_modules instead of the network.
    return nextResolve(specifier, {
      ...context,
      parentURL: hostFallbackParentURL(),
    });
  }

  return nextResolve(specifier, context);
}

export async function load(
  url: string,
  context: LoadContext,
  nextLoad: NextLoad,
): Promise<LoadResult> {
  if (!isHttpUrl(url)) {
    return nextLoad(url, context);
  }

  assertAllowed(url);

  const { source, contentType } = await fetchSource(url);

  return {
    format: inferFormat(url, contentType),
    source,
    shortCircuit: true,
  };
}

/** Test-only helper: clears allowlist and source cache. */
export function resetNativeHttpLoaderStateForTesting(): void {
  allowedOrigins.clear();
  sourceCache.clear();
}
