import type { ModuleInfo } from '@module-federation/sdk';
import type { BridgeSSRMessage } from '../types';
export const BRIDGE_PRODUCER_PROTOCOL =
  'module-federation/bridge-ssr/producer/v1';
export const CONTENT_TYPE = 'application/x-ndjson';
export const DEFAULT_FRAME_BYTES = 3 * 1024 * 1024;
export const DEFAULT_BUFFER_BYTES = 4 * 1024 * 1024;
export const BUFFER_HEADER = 'x-mf-bridge-buffer-bytes';
export type HydrationMode = 'progressive' | 'complete';
/** Selected by the producer for this render, never inferred from a Host cache. */
export interface BridgeServiceClient {
  name: string;
  expose: string;
  snapshot: ModuleInfo;
  dependencies?: { name: string; snapshot: ModuleInfo }[];
}
export type Meta = {
  type: 'meta';
  protocol: typeof BRIDGE_PRODUCER_PROTOCOL;
  buildVersion: string;
  identifierPrefix: string;
  hydration: HydrationMode;
  stylesheets?: string[];
  client?: BridgeServiceClient;
};
export type Frame =
  | Meta
  | BridgeSSRMessage
  | { type: 'error'; message: string };
export function error(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  // The HTML consumer and data consumer can start at different times.
  void promise.catch(() => {});
  return { promise, resolve, reject };
}
export function limits(options: {
  maxFrameBytes?: number;
  maxBufferedBytes?: number;
}) {
  const frame = options.maxFrameBytes ?? DEFAULT_FRAME_BYTES;
  const buffer = options.maxBufferedBytes ?? DEFAULT_BUFFER_BYTES;
  if (
    ![frame, buffer].every((value) => Number.isSafeInteger(value) && value > 0)
  )
    throw new Error('Bridge service byte limits must be positive integers.');
  return { frame, buffer };
}

/** Lines are bounded before decoding, including partial UTF-8 sequences. */
export async function* frames(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  maxBytes: number,
): AsyncGenerator<Frame> {
  let parts: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    let offset = 0;
    while (offset < next.value.byteLength) {
      const newline = next.value.indexOf(10, offset);
      const end = newline < 0 ? next.value.byteLength : newline;
      const part = next.value.subarray(offset, end);
      if (size + part.byteLength > maxBytes)
        throw new Error('Bridge service frame exceeds limit.');
      parts.push(part);
      size += part.byteLength;
      if (newline < 0) break;
      if (!size) throw new Error('Empty Bridge service frame.');
      const pending = new Uint8Array(size);
      let position = 0;
      for (const bytes of parts) {
        pending.set(bytes, position);
        position += bytes.byteLength;
      }
      let frame: unknown;
      try {
        frame = JSON.parse(
          new TextDecoder('utf-8', { fatal: true }).decode(pending),
        );
      } catch {
        throw new Error('Invalid Bridge service JSON frame.');
      }
      if (!frame || typeof frame !== 'object' || Array.isArray(frame))
        throw new Error('Invalid Bridge service frame.');
      parts = [];
      size = 0;
      yield frame as Frame;
      offset = newline + 1;
    }
  }
  if (size) throw new Error('Truncated Bridge service frame.');
}

export function validateStylesheets(
  value: unknown,
): asserts value is string[] | undefined {
  if (
    value !== undefined &&
    (!Array.isArray(value) ||
      !value.every((url) => {
        if (typeof url !== 'string') return false;
        try {
          return ['http:', 'https:'].includes(new URL(url).protocol);
        } catch {
          return false;
        }
      }))
  )
    throw new Error('Invalid Bridge service stylesheets.');
}

const MAX_MEMORY_ENTRIES = 256;

function isValidMemoryEntry(
  value: unknown,
  record: (v: unknown) => v is Record<string, unknown>,
): boolean {
  if (typeof value === 'string') {
    return value.startsWith('/');
  }
  if (!record(value)) return false;
  if (
    value.pathname !== undefined &&
    (typeof value.pathname !== 'string' || !value.pathname.startsWith('/'))
  )
    return false;
  if (value.search !== undefined && typeof value.search !== 'string')
    return false;
  if (value.hash !== undefined && typeof value.hash !== 'string') return false;
  if (value.key !== undefined && typeof value.key !== 'string') return false;
  if (value.state !== undefined && !record(value.state)) return false;
  return true;
}

function isValidMemoryRoute(
  value: unknown,
  record: (v: unknown) => v is Record<string, unknown>,
): boolean {
  if (!record(value)) return false;
  const hasEntryPath = value.entryPath !== undefined;
  const hasEntries = value.initialEntries !== undefined;
  if (!hasEntryPath && !hasEntries) return false;
  if (
    hasEntryPath &&
    (typeof value.entryPath !== 'string' || !value.entryPath.startsWith('/'))
  )
    return false;
  if (hasEntries) {
    if (
      !Array.isArray(value.initialEntries) ||
      value.initialEntries.length === 0 ||
      value.initialEntries.length > MAX_MEMORY_ENTRIES ||
      !value.initialEntries.every((entry) => isValidMemoryEntry(entry, record))
    )
      return false;
  }
  if (value.initialIndex !== undefined) {
    const count = hasEntries ? (value.initialEntries as unknown[]).length : 1;
    if (
      typeof value.initialIndex !== 'number' ||
      !Number.isSafeInteger(value.initialIndex) ||
      value.initialIndex < 0 ||
      value.initialIndex >= count
    )
      return false;
  }
  if (value.initialState !== undefined && !record(value.initialState))
    return false;
  if (
    value.basename !== undefined &&
    (typeof value.basename !== 'string' || !value.basename.startsWith('/'))
  )
    return false;
  return true;
}

/** The HTTP boundary accepts JSON application input, never DOM or closures. */
export function validateServiceRequest(
  value: unknown,
): asserts value is import('../types').BridgeSSRRequest {
  const input = value as import('../types').BridgeSSRRequest;
  const record = (value: unknown): value is Record<string, unknown> =>
    Boolean(value && typeof value === 'object' && !Array.isArray(value));
  if (
    !record(input) ||
    !record(input.props) ||
    typeof input.instanceId !== 'string' ||
    !input.instanceId ||
    input.instanceId.length > 1024 ||
    typeof input.identifierPrefix !== 'string' ||
    !input.identifierPrefix ||
    input.identifierPrefix.length > 8192 ||
    typeof input.url !== 'string' ||
    !['http:', 'https:'].includes(new URL(input.url).protocol) ||
    (input.moduleName !== undefined && typeof input.moduleName !== 'string') ||
    (input.basename !== undefined &&
      (typeof input.basename !== 'string' ||
        !input.basename.startsWith('/'))) ||
    (input.nonce !== undefined && typeof input.nonce !== 'string') ||
    (input.headers !== undefined &&
      (!record(input.headers) ||
        Object.values(input.headers).some(
          (value) => typeof value !== 'string',
        ))) ||
    (input.memoryRoute !== undefined &&
      !isValidMemoryRoute(input.memoryRoute, record))
  )
    throw Error('Invalid Bridge service request parameters.');
}

export function validateServiceClient(
  value: unknown,
): asserts value is BridgeServiceClient | undefined {
  if (value === undefined) return;
  const client = value as BridgeServiceClient;
  const validSnapshot = (snapshot: ModuleInfo | undefined) =>
    snapshot &&
    typeof snapshot.buildVersion === 'string' &&
    !!snapshot.buildVersion &&
    'remoteEntry' in snapshot &&
    typeof snapshot.remoteEntry === 'string' &&
    !!snapshot.remoteEntry &&
    'modules' in snapshot &&
    Array.isArray(snapshot.modules);
  if (
    !client ||
    typeof client.name !== 'string' ||
    !client.name ||
    typeof client.expose !== 'string' ||
    !client.expose.startsWith('./') ||
    !validSnapshot(client.snapshot) ||
    (client.dependencies !== undefined &&
      (!Array.isArray(client.dependencies) ||
        client.dependencies.some(
          (item) =>
            !item ||
            typeof item.name !== 'string' ||
            !validSnapshot(item.snapshot),
        )))
  )
    throw Error('Invalid Bridge Service client description');
}
