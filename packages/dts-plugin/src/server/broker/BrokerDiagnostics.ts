import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import type { DiagnosticLog } from '../utils/log';

const LOG_PATH = '/__mf/logs';
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

interface StoredLog extends DiagnosticLog {
  sequence: number;
  truncated?: boolean;
}

interface LogQuery {
  after?: string;
  limit?: number;
  source?: string;
  consumer?: string;
  remote?: string;
}

/** A bounded snapshot of this broker's lifetime, independent of DEBUG files. */
export class BrokerDiagnostics {
  readonly info = { brokerId: randomUUID(), path: LOG_PATH };
  private entries: { value: StoredLog; bytes: number }[] = [];
  private bytes = 0;
  private sequence = 0;
  private discardedThrough = 0;

  constructor(private limits = { entries: 2000, bytes: 2 * 1024 * 1024 }) {
    if (limits.entries < 1 || limits.bytes < 512)
      throw new RangeError('Diagnostic capacity must hold at least one record');
  }

  record(log: DiagnosticLog) {
    const sequence = ++this.sequence;
    let value: StoredLog = { ...log, sequence };
    let serialized = JSON.stringify(value);
    const recordLimit = Math.min(this.limits.bytes, 32 * 1024);
    if (Buffer.byteLength(serialized) > recordLimit) {
      // A huge stack or legacy message must not evict the entire useful history.
      // Retain normal operation context so truncated failures remain filterable.
      value = { ...value, message: '', truncated: true };
      if (Buffer.byteLength(JSON.stringify(value)) > recordLimit) {
        value = {
          sequence,
          timestamp: log.timestamp.slice(0, 40),
          source: log.source.slice(0, 128),
          level: log.level.slice(0, 16),
          message: '',
          truncated: true,
        };
      }
      const available = recordLimit - Buffer.byteLength(JSON.stringify(value));
      // Six bytes per UTF-16 code unit also bounds JSON control-character escapes.
      value.message = log.message.slice(
        0,
        Math.max(0, Math.floor(available / 6)),
      );
      serialized = JSON.stringify(value);
    }
    const bytes = Buffer.byteLength(serialized);
    // Detach retained context from mutable data owned by the caller.
    this.entries.push({ value: JSON.parse(serialized), bytes });
    this.bytes += bytes;
    while (
      this.entries.length > this.limits.entries ||
      this.bytes > this.limits.bytes
    ) {
      const oldest = this.entries.shift()!;
      this.bytes -= oldest.bytes;
      this.discardedThrough = oldest.value.sequence;
    }
  }

  query(query: LogQuery = {}) {
    const limit = query.limit ?? 100;
    if (!Number.isInteger(limit) || limit < 1 || limit > 500)
      throw new RangeError('limit must be an integer between 1 and 500');
    let after = 0;
    let reset = false;
    if (query.after !== undefined) {
      const separator = query.after.lastIndexOf(':');
      const instance = query.after.slice(0, separator);
      const number = query.after.slice(separator + 1);
      if (separator < 1 || !/^\d+$/.test(number))
        throw new RangeError(
          'after must be a cursor returned by this endpoint',
        );
      after = Number(number);
      if (!Number.isSafeInteger(after))
        throw new RangeError('Invalid diagnostic cursor');
      reset = instance !== this.info.brokerId || after > this.sequence;
      if (reset) after = 0;
    }
    const matches = this.entries
      .map(({ value }) => value)
      .filter(
        (entry) =>
          entry.sequence > after &&
          (!query.source || entry.source === query.source) &&
          (!query.consumer || entry.context?.consumer === query.consumer) &&
          (!query.remote ||
            entry.context?.remote === query.remote ||
            entry.context?.entry === query.remote),
      );
    const entries =
      query.after === undefined
        ? matches.slice(-limit)
        : matches.slice(0, limit);
    const hasMore =
      query.after !== undefined && matches.length > entries.length;
    const last = hasMore ? entries[entries.length - 1].sequence : this.sequence;
    return {
      brokerId: this.info.brokerId,
      entries,
      nextCursor: `${this.info.brokerId}:${last}`,
      truncated:
        after < this.discardedThrough ||
        (query.after === undefined && matches.length > entries.length),
      reset,
      hasMore,
    };
  }

  /** Returns false for unrelated paths so the caller can send its normal 404. */
  handleRequest(req: IncomingMessage, res: ServerResponse): boolean {
    let url: URL;
    try {
      url = new URL(req.url || '/', 'http://localhost');
    } catch {
      return false;
    }
    if (url.pathname !== LOG_PATH) return false;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const reply = (status: number, body: unknown) => {
      res.statusCode = status;
      res.end(JSON.stringify(body));
    };
    // Keep existing remote WebSocket behavior, but do not expose logs to the LAN
    // or browser pages using a different origin / DNS-rebound host.
    let localHost = false;
    let sameOrigin = false;
    try {
      const host = new URL(`http://${req.headers.host}`);
      localHost = LOCAL_HOSTS.has(host.hostname);
      sameOrigin = !req.headers.origin || req.headers.origin === host.origin;
    } catch {}
    if (
      !LOOPBACK.has(req.socket.remoteAddress || '') ||
      !localHost ||
      !sameOrigin
    ) {
      reply(403, {
        error: 'Development diagnostics are only available locally',
      });
      return true;
    }
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      reply(405, { error: 'Use GET to read development diagnostics' });
      return true;
    }
    try {
      const params = url.searchParams;
      reply(
        200,
        this.query({
          after: params.get('after') ?? undefined,
          limit: params.has('limit') ? Number(params.get('limit')) : undefined,
          source: params.get('source') ?? undefined,
          consumer: params.get('consumer') ?? undefined,
          remote: params.get('remote') ?? undefined,
        }),
      );
    } catch (error) {
      reply(400, {
        error: error instanceof Error ? error.message : 'Invalid log query',
      });
    }
    return true;
  }
}
