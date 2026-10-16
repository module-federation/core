import { createHash } from 'node:crypto';

export interface BridgeServiceCacheOptions {
  /** Absolute lifetime of a completed render, measured from cache insertion. */
  maxAgeMs: number;
  /** Maximum number of completed renders retained. Defaults to 128. */
  maxEntries?: number;
  /** Maximum retained transcript bytes. Defaults to 32 MiB. */
  maxBytes?: number;
  /** Maximum bytes for one transcript. Defaults to min(1 MiB, maxBytes). */
  maxEntryBytes?: number;
}

type Entry = {
  chunks: Uint8Array[];
  bytes: number;
  expiresAt: number;
};

function positiveInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value) || value <= 0)
    throw new Error(
      `Bridge service cache ${name} must be a positive safe integer.`,
    );
  return value;
}

/**
 * Request-local streams never enter this store. The handler commits a transcript
 * only after successful completion, and every reader receives independent bytes.
 */
export function createBridgeServiceCache(options: BridgeServiceCacheOptions) {
  const maxAgeMs = positiveInteger(options.maxAgeMs, 'maxAgeMs');
  const maxEntries = positiveInteger(options.maxEntries ?? 128, 'maxEntries');
  const maxBytes = positiveInteger(
    options.maxBytes ?? 32 * 1024 * 1024,
    'maxBytes',
  );
  const maxEntryBytes = positiveInteger(
    options.maxEntryBytes ?? Math.min(1024 * 1024, maxBytes),
    'maxEntryBytes',
  );
  if (maxEntryBytes > maxBytes)
    throw new Error(
      'Bridge service cache maxEntryBytes must not exceed maxBytes.',
    );

  const entries = new Map<string, Entry>();
  let bytes = 0;
  const remove = (key: string) => {
    const entry = entries.get(key);
    if (!entry) return;
    bytes -= entry.bytes;
    entries.delete(key);
  };
  return {
    maxEntryBytes,
    /** Hash the complete serialized request; no field is selected or rewritten. */
    key(input: string): string {
      return createHash('sha256').update(input).digest('hex');
    },
    get(key: string, maxReplayBytes?: number): Uint8Array[] | undefined {
      const entry = entries.get(key);
      if (!entry) return;
      if (entry.expiresAt <= Date.now()) {
        remove(key);
        return;
      }
      // Reject before copying; a caller with a larger budget can still reuse it.
      if (maxReplayBytes !== undefined && entry.bytes > maxReplayBytes) return;
      entries.delete(key);
      entries.set(key, entry);
      return entry.chunks.map((chunk) => new Uint8Array(chunk));
    },
    set(key: string, chunks: readonly Uint8Array[]): boolean {
      let size = 0;
      for (const chunk of chunks) {
        size += chunk.byteLength;
        if (size > maxEntryBytes) return false;
      }
      const copy = chunks
        .filter((chunk) => chunk.byteLength > 0)
        .map((chunk) => new Uint8Array(chunk));
      const now = Date.now();
      // Expired entries may occur anywhere in LRU order after cache reads.
      for (const [entryKey, entry] of entries)
        if (entry.expiresAt <= now) remove(entryKey);
      remove(key);
      while (entries.size >= maxEntries || bytes + size > maxBytes)
        remove(entries.keys().next().value!);
      entries.set(key, {
        chunks: copy,
        bytes: size,
        expiresAt: now + maxAgeMs,
      });
      bytes += size;
      return true;
    },
  };
}
