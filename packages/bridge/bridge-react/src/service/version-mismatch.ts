import { BRIDGE_PRODUCER_PROTOCOL } from './protocol';
import type { BridgeStreamErrorFrame } from '../ssr-stream/protocol';

export const BRIDGE_SERVICE_VERSION_MISMATCH =
  'BRIDGE_SERVICE_VERSION_MISMATCH' as const;

export interface BridgeServiceVersionMismatchMetadata {
  expectedBuildVersion: string;
  actualBuildVersion: string;
}

/** A pre-render deployment mismatch, not permission to replay the request. */
export class BridgeServiceVersionMismatchError extends Error {
  readonly name = 'BridgeServiceVersionMismatchError';
  readonly code = BRIDGE_SERVICE_VERSION_MISMATCH;
  readonly status = 409;
  readonly expectedBuildVersion: string;
  readonly actualBuildVersion: string;

  constructor(metadata: BridgeServiceVersionMismatchMetadata) {
    super('Bridge service returned HTTP 409: buildVersion mismatch.');
    this.expectedBuildVersion = metadata.expectedBuildVersion;
    this.actualBuildVersion = metadata.actualBuildVersion;
  }
}

const hasVersions = (
  value: Record<string, unknown>,
): value is Record<string, unknown> & BridgeServiceVersionMismatchMetadata =>
  typeof value.expectedBuildVersion === 'string' &&
  value.expectedBuildVersion.length > 0 &&
  typeof value.actualBuildVersion === 'string' &&
  value.actualBuildVersion.length > 0 &&
  value.expectedBuildVersion !== value.actualBuildVersion;

/** Also accepts errors originating from another copy of the Bridge package. */
export function isBridgeServiceVersionMismatchError(
  value: unknown,
): value is BridgeServiceVersionMismatchError {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    candidate.name === 'BridgeServiceVersionMismatchError' &&
    candidate.code === BRIDGE_SERVICE_VERSION_MISMATCH &&
    candidate.status === 409 &&
    typeof candidate.message === 'string' &&
    hasVersions(candidate)
  );
}

/** Preserve only the public deployment mismatch across the browser transport. */
export function bridgeServiceErrorFrame(
  error: unknown,
  message: string,
): BridgeStreamErrorFrame {
  return {
    type: 'error',
    message,
    ...(isBridgeServiceVersionMismatchError(error)
      ? {
          versionMismatch: {
            code: BRIDGE_SERVICE_VERSION_MISMATCH,
            expectedBuildVersion: error.expectedBuildVersion,
            actualBuildVersion: error.actualBuildVersion,
          },
        }
      : {}),
  };
}

// Reserved for this protocol's pre-render version check and transparent ingress.
export const VERSION_MISMATCH_CONTENT_TYPE =
  'application/vnd.module-federation.bridge-service-error+json';

export function versionMismatchResponse(
  metadata: BridgeServiceVersionMismatchMetadata,
): Response {
  return new Response(
    JSON.stringify({
      protocol: BRIDGE_PRODUCER_PROTOCOL,
      code: BRIDGE_SERVICE_VERSION_MISMATCH,
      expectedBuildVersion: metadata.expectedBuildVersion,
      actualBuildVersion: metadata.actualBuildVersion,
    }),
    {
      status: 409,
      headers: {
        'content-type': `${VERSION_MISMATCH_CONTENT_TYPE}; charset=utf-8`,
        'cache-control': 'no-store',
      },
    },
  );
}

export async function readVersionMismatch(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  maxBytes: number,
  expectedBuildVersion: string,
): Promise<BridgeServiceVersionMismatchError | undefined> {
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let text = '';
  while (true) {
    const next = await reader.read();
    if (next.done) break;
    size += next.value.byteLength;
    if (size > maxBytes)
      throw new Error('Bridge service HTTP 409 response exceeds limit.');
    text += decoder.decode(next.value, { stream: true });
  }
  let payload: unknown;
  try {
    payload = JSON.parse(text + decoder.decode());
  } catch {
    return undefined;
  }
  if (!payload || typeof payload !== 'object') return undefined;
  const candidate = payload as Record<string, unknown>;
  if (
    candidate.protocol !== BRIDGE_PRODUCER_PROTOCOL ||
    candidate.code !== BRIDGE_SERVICE_VERSION_MISMATCH ||
    candidate.expectedBuildVersion !== expectedBuildVersion ||
    !hasVersions(candidate)
  )
    return undefined;
  return new BridgeServiceVersionMismatchError(candidate);
}
