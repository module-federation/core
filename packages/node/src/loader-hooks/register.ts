import * as nodeModule from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { MessageChannel } from 'node:worker_threads';
import {
  ACK_MESSAGE,
  ADD_ORIGIN_MESSAGE,
  MF_NATIVE_LOADER_ENV_FLAG,
  MF_NATIVE_LOADER_HOSTS_ENV,
  MF_NODE_LOG_PREFIX,
  getNativeHttpLoaderState,
  normalizeOrigin,
  setNativeHttpLoaderState,
} from './protocol';
import type {
  AckMessage,
  NativeHttpLoaderInitializeData,
  NativeHttpLoaderState,
} from './protocol';

/** How long to wait for the hooks thread to acknowledge an allowlist update. */
const ACK_TIMEOUT_MS = 10_000;

type ModuleRegisterFn = (
  specifier: string,
  options: {
    data: NativeHttpLoaderInitializeData;
    transferList: unknown[];
  },
) => void;

export interface RegisterNativeHttpLoaderOptions {
  /**
   * File URL of the hooks module passed to `module.register()`. Defaults to
   * the `hooks.mjs` build shipped alongside this module. ESM consumers that
   * call this function directly (instead of importing
   * `@module-federation/node/register`) must provide it explicitly.
   */
  hooksUrl?: string;
  /** Origins allowed to serve modules in addition to registered MF remotes. */
  allowedOrigins?: string[];
}

function getModuleRegister(): ModuleRegisterFn | undefined {
  const candidate = (nodeModule as { register?: unknown }).register;
  return typeof candidate === 'function'
    ? (candidate as ModuleRegisterFn)
    : undefined;
}

function isDisabledByEnv(): boolean {
  const flag = process.env[MF_NATIVE_LOADER_ENV_FLAG];
  return flag === '0' || flag === 'false';
}

function defaultHooksUrl(): string {
  // `__dirname` only exists in the CommonJS build; the ESM build (and the
  // `@module-federation/node/register` entry point) passes `hooksUrl` in.
  if (typeof __dirname === 'string') {
    return pathToFileURL(join(__dirname, 'hooks.mjs')).href;
  }
  throw new Error(
    `${MF_NODE_LOG_PREFIX} Unable to locate the loader hooks module. ` +
      'Either import "@module-federation/node/register" (which resolves it ' +
      'automatically) or pass `hooksUrl` to registerNativeHttpLoader().',
  );
}

function envAllowedOrigins(): string[] {
  const raw = process.env[MF_NATIVE_LOADER_HOSTS_ENV];
  if (!raw) {
    return [];
  }
  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function collectOrigins(values: string[]): string[] {
  const origins: string[] = [];
  for (const value of values) {
    try {
      origins.push(normalizeOrigin(value));
    } catch {
      console.warn(
        `${MF_NODE_LOG_PREFIX} Ignoring invalid allowlist entry "${value}" for the native HTTP loader.`,
      );
    }
  }
  return origins;
}

/**
 * Returns true when this Node.js version supports the off-thread module
 * customization hooks API (`module.register`, Node >= 18.19 / 20.6).
 */
export function isNativeHttpLoaderSupported(): boolean {
  return getModuleRegister() !== undefined;
}

/**
 * Registers the Module Federation native HTTP(S) ESM loader hooks via
 * `module.register()`. Idempotent: repeated calls merge additional allowed
 * origins into the existing registration.
 *
 * Returns the loader state, or `undefined` when the running Node.js version
 * does not support module customization hooks or the loader is disabled via
 * `MF_NODE_NATIVE_LOADER=0`.
 */
export function registerNativeHttpLoader(
  options: RegisterNativeHttpLoaderOptions = {},
): NativeHttpLoaderState | undefined {
  // Kill switch: when disabled, module.register() must never be called and no
  // state is created, so the runtime plugin falls back to the vm-based path.
  if (isDisabledByEnv()) {
    console.debug(
      `${MF_NODE_LOG_PREFIX} Native HTTP loader disabled via ${MF_NATIVE_LOADER_ENV_FLAG}; skipping registration.`,
    );
    return undefined;
  }

  const existing = getNativeHttpLoaderState();
  const staticOrigins = collectOrigins([
    ...(options.allowedOrigins ?? []),
    ...envAllowedOrigins(),
  ]);

  if (existing) {
    // Fire-and-forget is safe here: allowOrigin() shares one in-flight
    // acknowledgement per origin, so any later import path that awaits
    // allowOrigin() for the same origin joins the pending ack instead of
    // racing ahead of the hooks thread.
    for (const origin of staticOrigins) {
      existing.allowOrigin(origin).catch((error) => {
        console.warn(
          `${MF_NODE_LOG_PREFIX} Failed to allow origin "${origin}" on the native HTTP loader:`,
          error,
        );
      });
    }
    return existing;
  }

  const moduleRegister = getModuleRegister();
  if (!moduleRegister) {
    console.warn(
      `${MF_NODE_LOG_PREFIX} module.register() is not available in this ` +
        'Node.js version; the native HTTP loader is disabled and Module ' +
        'Federation will keep using the default vm-based loading path.',
    );
    return undefined;
  }

  const hooksUrl = options.hooksUrl ?? defaultHooksUrl();
  const { port1, port2 } = new MessageChannel();

  // Origins the hooks thread is known to accept: statically seeded origins are
  // passed through the (synchronously applied) initialize data; dynamic ones
  // are added only once the hooks thread acknowledges them.
  const allowedOrigins = new Set<string>(staticOrigins);
  const pendingByOrigin = new Map<string, Promise<void>>();
  let nextMessageId = 0;
  const pendingAcks = new Map<number, () => void>();

  port1.on('message', (message: unknown) => {
    const msg = message as AckMessage;
    if (msg && msg.type === ACK_MESSAGE) {
      const resolveAck = pendingAcks.get(msg.id);
      pendingAcks.delete(msg.id);
      if (pendingAcks.size === 0) {
        // Idle again: stop keeping the event loop alive.
        port1.unref();
      }
      resolveAck?.();
    }
  });
  // The channel must not keep the process alive while idle; allowOrigin()
  // re-refs it while an ack round-trip is in flight so the process cannot
  // exit mid-handshake.
  port1.unref();

  const initializeData: NativeHttpLoaderInitializeData = {
    allowedOrigins: Array.from(allowedOrigins),
    port: port2,
  };

  moduleRegister(hooksUrl, {
    data: initializeData,
    transferList: [port2],
  });

  const state: NativeHttpLoaderState = {
    allowedOrigins,
    allowOrigin(origin: string): Promise<void> {
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.has(normalized)) {
        return Promise.resolve();
      }
      // Concurrent callers for the same origin share the in-flight ack, so
      // nobody resolves before the hooks thread has actually applied the
      // allowlist update.
      const pending = pendingByOrigin.get(normalized);
      if (pending) {
        return pending;
      }
      const promise = new Promise<void>((resolve, reject) => {
        const id = nextMessageId++;
        const settle = () => {
          clearTimeout(timer);
          pendingAcks.delete(id);
          pendingByOrigin.delete(normalized);
          if (pendingAcks.size === 0) {
            port1.unref();
          }
        };
        // Bounded wait: a broken port must fail loudly instead of hanging the
        // process forever via port1.ref().
        const timer = setTimeout(() => {
          settle();
          reject(
            new Error(
              `${MF_NODE_LOG_PREFIX} Timed out after ${ACK_TIMEOUT_MS}ms waiting ` +
                `for the loader hooks thread to acknowledge origin "${normalized}".`,
            ),
          );
        }, ACK_TIMEOUT_MS);
        timer.unref?.();
        pendingAcks.set(id, () => {
          settle();
          allowedOrigins.add(normalized);
          resolve();
        });
        // Keep the event loop alive until the hooks thread acknowledges.
        port1.ref();
        port1.postMessage({
          id,
          type: ADD_ORIGIN_MESSAGE,
          origin: normalized,
        });
      });
      pendingByOrigin.set(normalized, promise);
      return promise;
    },
  };

  setNativeHttpLoaderState(state);
  return state;
}
