import { Readable, type Transform } from 'node:stream';
import type {
  BridgeSSRMessage,
  BridgeSSRMessageResult,
  BridgeSSRRequest,
  BridgeSSRResult,
} from '../ssr';
import { htmlFrames, type HTMLFrame } from './frames.server';
import { createReactStreamScriptIsolator } from './script-isolation.server';
import { channel } from './message-channel.server';

export const BRIDGE_PRODUCER_PROTOCOL =
  'module-federation/bridge-ssr/producer/v1';

/** Framework byte streams are normalized once, inside the producer's Node entry. */
export async function normalizeBridgeSSR(
  result: BridgeSSRResult | BridgeSSRMessageResult,
  info: BridgeSSRRequest,
  options: {
    maxFrameBytes?: number;
    maxBufferedBytes?: number;
    hydrationMode?: 'progressive' | 'complete';
  } = {},
): Promise<BridgeSSRMessageResult> {
  if ('protocol' in result) {
    if (result.protocol !== BRIDGE_PRODUCER_PROTOCOL)
      throw Error('Unsupported Bridge producer message protocol');
    return result;
  }
  const raw = result;
  const maxFrameBytes = options.maxFrameBytes ?? 2 * 1024 * 1024;
  const maxBufferedBytes = options.maxBufferedBytes ?? 4 * 1024 * 1024;
  if (
    ![maxFrameBytes, maxBufferedBytes].every(
      (value) => Number.isSafeInteger(value) && value > 0,
    )
  )
    throw Error('Bridge producer byte limits must be positive integers');
  void raw.snapshot?.catch(() => {});
  void raw.hydration?.snapshot.catch(() => {});
  const hydration =
    options.hydrationMode === 'complete' ? undefined : raw.hydration;
  const snapshot = hydration ? undefined : raw.snapshot;
  let rejectInterrupted!: (reason: unknown) => void;
  const interrupted = new Promise<never>((_, reject) => {
    rejectInterrupted = reject;
  });
  void interrupted.catch(() => {});
  let source: Readable | undefined;
  let framed: Transform | undefined;
  let updatesReader: ReadableStreamDefaultReader<unknown> | undefined;
  let started = false;
  let stopped = false;
  let aborted = false;
  const cleanup = () => info.signal.removeEventListener('abort', onAbort);
  const abort = (reason: unknown = Error('Bridge producer cancelled')) => {
    if (aborted) return;
    aborted = true;
    stopped = true;
    cleanup();
    const failure = reason instanceof Error ? reason : Error(String(reason));
    rejectInterrupted(failure);
    output.fail(failure);
    try {
      raw.abort(failure);
    } catch {
      // Framework abort failure must not prevent stream cleanup.
    } finally {
      source?.destroy(failure);
      framed?.destroy(failure);
      if (!source) void raw.stream.cancel(failure).catch(() => {});
      if (updatesReader) void updatesReader.cancel(failure).catch(() => {});
      else void raw.hydration?.updates.cancel(failure).catch(() => {});
    }
  };
  const onAbort = () => abort(info.signal.reason);
  const output = channel<BridgeSSRMessage>(
    { bytes: 0, limit: maxBufferedBytes },
    abort,
    () => {
      if (started || stopped) return;
      started = true;
      void produce();
    },
  );
  info.signal.addEventListener('abort', onAbort, { once: true });
  if (info.signal.aborted) onAbort();
  const wait = <T>(promise: Promise<T>) => Promise.race([promise, interrupted]);
  if (stopped) await interrupted;
  if (!hydration && !snapshot) {
    const failure = Error(
      'Complete Bridge hydration requires a final snapshot',
    );
    abort(failure);
    throw failure;
  }
  if (hydration && !hydration.shellMarker) {
    const failure = Error('Incomplete producer hydration metadata');
    abort(failure);
    throw failure;
  }
  const send = (message: BridgeSSRMessage) => {
    if (stopped) throw Error('Bridge producer is closed');
    if (message.type === 'done') {
      output.push(message, Buffer.byteLength('{"type":"done"}'));
      return;
    }
    const text = JSON.stringify(message);
    // HTML is already an owned immutable string. Data must still be captured
    // now, including toJSON, undefined-field validation and mutation isolation.
    const serialized =
      message.type === 'html'
        ? message
        : (JSON.parse(text) as BridgeSSRMessage);
    const required =
      message.type === 'ready' || message.type === 'data'
        ? 'snapshot'
        : message.type === 'update'
          ? 'value'
          : undefined;
    if (required && !Object.hasOwn(serialized, required))
      throw Error(`Bridge producer ${message.type} lost its ${required}`);
    output.push(serialized, Buffer.byteLength(text));
  };
  async function produce() {
    let updatesTask: Promise<void> | undefined;
    let readyTask: Promise<void> | undefined;
    const startUpdates = (forward: boolean) => {
      if (!raw.hydration) return;
      updatesReader = raw.hydration.updates.getReader();
      const reader = updatesReader;
      updatesTask = (async () => {
        while (true) {
          const next = await wait(reader.read());
          if (next.done) break;
          if (forward) send({ type: 'update', value: next.value });
        }
      })();
      // A rejected data stream must unblock a stalled HTML stream too.
      void updatesTask.catch(abort);
    };
    try {
      source = Readable.fromWeb(
        raw.stream as Parameters<typeof Readable.fromWeb>[0],
      );
      framed = htmlFrames({
        maxFrameBytes,
        includeMetadata: true,
        shellMarker: hydration?.shellMarker,
      });
      const isolate = createReactStreamScriptIsolator(
        info.identifierPrefix,
        info.identifierPrefix,
      );
      source.on('error', (reason) => framed?.destroy(reason));
      // Install error handlers even when cancellation races the first read.
      framed.on('error', () => {});
      source.pipe(framed);
      if (!hydration) startUpdates(false);
      let ready = false;
      for await (const piece of framed) {
        const { html, scripts, hasShellMarker } = piece as HTMLFrame;
        send({
          type: 'html',
          html: isolate(html, scripts),
        });
        if (hydration && !ready && hasShellMarker) {
          ready = true;
          readyTask = (async () => {
            const initial = await wait(hydration.snapshot);
            if (initial === undefined)
              throw Error('Incomplete producer hydration metadata');
            send({ type: 'ready', snapshot: initial });
            startUpdates(true);
          })();
          void readyTask.catch(abort);
        }
      }
      if (hydration && !ready)
        throw Error('Missing Bridge application shell marker');
      await readyTask;
      await updatesTask;
      if (snapshot) {
        send({ type: 'data', snapshot: await wait(snapshot) });
      }
      send({ type: 'done' });
      stopped = true;
      cleanup();
      output.close();
    } catch (reason) {
      abort(reason);
    } finally {
      await readyTask?.catch(() => {});
      await updatesTask?.catch(() => {});
      updatesReader?.releaseLock();
    }
  }
  return {
    protocol: BRIDGE_PRODUCER_PROTOCOL,
    stylesheets: raw.stylesheets,
    hydration: hydration ? 'progressive' : 'complete',
    messages: output.stream,
    abort,
  };
}
