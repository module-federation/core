import path from 'path';
import { fileURLToPath } from 'url';
import { once } from 'events';
import { rpc } from '../core';
import {
  DEV_BUILD_CHANNEL,
  devBuildKey,
  type DevBuildConnectionOptions,
  type DevBuildPublication,
  type DevBuildRemote,
  type DevBuildStatus,
  type DevBuildUpdate,
} from '../server/buildProtocol';

export type {
  DevBuildConnectionOptions,
  DevBuildPublication,
  DevBuildRemote,
  DevBuildSource,
  DevBuildStatus,
  DevBuildUpdate,
} from '../server/buildProtocol';

export interface DevBuildCallbacks {
  onUpdate(
    update: DevBuildUpdate,
    options: { signal: AbortSignal },
  ): Promise<void>;
  onStatus?(remote: DevBuildRemote, status: DevBuildStatus): void;
  onError?(error: unknown): void;
}

/** Framework-owned build readiness, independent of dts and browser reload. */
export function createDevBuildConnection(
  options: DevBuildConnectionOptions,
  callbacks: DevBuildCallbacks,
) {
  if (options.publisher) devBuildKey(options.publisher);
  for (const remote of options.remotes || []) devBuildKey(remote);
  const lifetime = new AbortController();
  const statuses = new Map<string, DevBuildStatus>();
  const pending = new Set<Promise<void>>();
  let closing: Promise<void> | undefined;
  const filename = fileURLToPath(import.meta.url);
  const worker = rpc.createRpcWorker(
    path.join(
      path.dirname(filename),
      `fork-dev-worker${path.extname(filename) === '.mjs' ? '.mjs' : '.js'}`,
    ),
    {},
    undefined,
    false,
  );
  const connected: Promise<void> = worker.connect({
    name: options.publisher?.name || 'build-subscriber',
    build: options,
  });
  const process = worker.process!;
  const send = (message: Record<string, unknown>) => {
    if (process.connected && !lifetime.signal.aborted)
      process.send({ type: DEV_BUILD_CHANNEL, ...message }, (error) => {
        if (error && !lifetime.signal.aborted) callbacks.onError?.(error);
      });
  };
  const setStatus = (remote: DevBuildRemote, status: DevBuildStatus) => {
    statuses.set(devBuildKey(remote), status);
    callbacks.onStatus?.(remote, status);
  };
  process.on('message', (message: any) => {
    if (message?.type !== DEV_BUILD_CHANNEL || lifetime.signal.aborted) return;
    if (message.kind === 'status') {
      setStatus(message.remote, message.status);
    } else if (message.kind === 'update') {
      const operation = Promise.resolve()
        .then(() =>
          callbacks.onUpdate(message.update, { signal: lifetime.signal }),
        )
        .then(
          () => send({ kind: 'ack', id: message.id }),
          (error) => {
            callbacks.onError?.(error);
            send({ kind: 'ack', id: message.id, error: String(error) });
          },
        );
      pending.add(operation);
      void operation.finally(() => pending.delete(operation));
    }
  });
  process.once('exit', () => {
    for (const remote of options.remotes || [])
      setStatus(remote, 'disconnected');
  });
  void connected.catch((error) => {
    if (!lifetime.signal.aborted) callbacks.onError?.(error);
  });
  return {
    publish(publication: DevBuildPublication) {
      if (!publication.buildVersion)
        throw new TypeError('A ready build requires a buildVersion');
      send({ kind: 'publish', publication });
    },
    invalidate() {
      send({ kind: 'invalidate' });
    },
    isSynchronized(remote: DevBuildRemote) {
      return (
        !lifetime.signal.aborted &&
        statuses.get(devBuildKey(remote)) === 'ready'
      );
    },
    close() {
      return (closing ||= (async () => {
        lifetime.abort();
        const exited =
          process.exitCode !== null || process.signalCode !== null
            ? Promise.resolve()
            : once(process, 'exit');
        worker.terminate();
        await Promise.allSettled([...pending]);
        await exited;
      })());
    },
  };
}
