import * as nodeModule from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { MessageChannel } from 'node:worker_threads';
import {
  ACK_MESSAGE,
  ADD_ORIGIN_MESSAGE,
  MF_NATIVE_LOADER_HOSTS_ENV,
  normalizeOrigin,
} from './protocol';
import type {
  AckMessage,
  NativeHttpLoaderInitializeData,
  NativeHttpLoaderState,
} from './protocol';
import { getNativeHttpLoaderState, setNativeHttpLoaderState } from './state';

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

function defaultHooksUrl(): string {
  // `__dirname` only exists in the CommonJS build; the ESM build (and the
  // `@module-federation/node/register` entry point) passes `hooksUrl` in.
  if (typeof __dirname === 'string') {
    return pathToFileURL(join(__dirname, 'hooks.mjs')).href;
  }
  throw new Error(
    '[@module-federation/node] Unable to locate the loader hooks module. ' +
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
        `[@module-federation/node] Ignoring invalid allowlist entry "${value}" for the native HTTP loader.`,
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
 * does not support module customization hooks.
 */
export function registerNativeHttpLoader(
  options: RegisterNativeHttpLoaderOptions = {},
): NativeHttpLoaderState | undefined {
  const existing = getNativeHttpLoaderState();
  const staticOrigins = collectOrigins([
    ...(options.allowedOrigins ?? []),
    ...envAllowedOrigins(),
  ]);

  if (existing) {
    for (const origin of staticOrigins) {
      void existing.allowOrigin(origin);
    }
    return existing;
  }

  const moduleRegister = getModuleRegister();
  if (!moduleRegister) {
    console.warn(
      '[@module-federation/node] module.register() is not available in this ' +
        'Node.js version; the native HTTP loader is disabled and Module ' +
        'Federation will keep using the default vm-based loading path.',
    );
    return undefined;
  }

  const hooksUrl = options.hooksUrl ?? defaultHooksUrl();
  const { port1, port2 } = new MessageChannel();

  const allowedOrigins = new Set<string>(staticOrigins);
  let nextMessageId = 0;
  const pendingAcks = new Map<number, () => void>();

  port1.on('message', (message: unknown) => {
    const msg = message as AckMessage;
    if (msg && msg.type === ACK_MESSAGE) {
      const resolveAck = pendingAcks.get(msg.id);
      pendingAcks.delete(msg.id);
      resolveAck?.();
    }
  });
  // The channel must not keep the process alive on its own.
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
    enabled: true,
    allowedOrigins,
    allowOrigin(origin: string): Promise<void> {
      const normalized = normalizeOrigin(origin);
      if (allowedOrigins.has(normalized)) {
        return Promise.resolve();
      }
      allowedOrigins.add(normalized);
      return new Promise<void>((resolve) => {
        const id = nextMessageId++;
        pendingAcks.set(id, resolve);
        port1.postMessage({
          id,
          type: ADD_ORIGIN_MESSAGE,
          origin: normalized,
        });
      });
    },
  };

  setNativeHttpLoaderState(state);
  return state;
}
