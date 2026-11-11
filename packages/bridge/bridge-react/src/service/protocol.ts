import type { BridgeSSRMessage } from '../types';
export const BRIDGE_PRODUCER_PROTOCOL =
  'module-federation/bridge-ssr/producer/v1';
export const CONTENT_TYPE = 'application/x-ndjson';
export const DEFAULT_FRAME_BYTES = 3 * 1024 * 1024;
export const DEFAULT_BUFFER_BYTES = 4 * 1024 * 1024;
export const BUFFER_HEADER = 'x-mf-bridge-buffer-bytes';
export type HydrationMode = 'progressive' | 'complete';
export type Meta = {
  type: 'meta';
  protocol: typeof BRIDGE_PRODUCER_PROTOCOL;
  buildVersion: string;
  identifierPrefix: string;
  hydration: HydrationMode;
  stylesheets?: string[];
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
      (!record(input.memoryRoute) ||
        typeof input.memoryRoute.entryPath !== 'string' ||
        !input.memoryRoute.entryPath.startsWith('/')))
  )
    throw Error('Invalid Bridge service request parameters.');
}
