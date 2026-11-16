import { randomUUID } from 'crypto';
import WebSocket from 'isomorphic-ws';
import {
  buildMessage,
  devBuildKey,
  type DevBuildMessage,
  type DevBuildPublication,
  type DevBuildRemote,
} from '../buildProtocol';
import { fileLog, type DiagnosticContext } from '../utils/log';

/** Build subscriptions share the DTS broker but never enter the types pipeline. */
export class BuildBroker {
  private publishers = new Map<
    string,
    {
      socket: WebSocket;
      remote: DevBuildRemote;
      publication?: DevBuildPublication;
      revision: string;
    }
  >();
  private subscribers = new Map<WebSocket, Map<string, DevBuildRemote>>();
  private clients = new Set<WebSocket>();
  private consumers = new Map<WebSocket, string>();

  constructor(private diagnostics?: { brokerId: string; path: string }) {}

  private log(
    message: string,
    remote: DevBuildRemote,
    socket?: WebSocket,
    details: DiagnosticContext = {},
    level = 'info',
  ) {
    fileLog(message, 'DevBuild', level, {
      consumer: socket ? this.consumers.get(socket) : undefined,
      remote: remote.name,
      entry: remote.entry,
      ...details,
    });
  }

  get hasClients() {
    return this.clients.size > 0;
  }

  private send(socket: WebSocket, message: string) {
    if (socket.readyState === WebSocket.OPEN) socket.send(message);
  }

  private state(socket: WebSocket, remote: DevBuildRemote) {
    const publisher = this.publishers.get(devBuildKey(remote));
    this.send(
      socket,
      buildMessage('state', {
        remote,
        publication: publisher?.publication,
        revision: publisher?.revision,
      }),
    );
  }

  private notify(key: string, log = true) {
    for (const [socket, remotes] of this.subscribers) {
      const remote = remotes.get(key);
      if (remote) {
        this.state(socket, remote);
        if (log)
          this.log('Consumer notified', remote, socket, {
            buildVersion: this.publishers.get(key)?.publication?.buildVersion,
          });
      }
    }
  }

  handle(message: DevBuildMessage, socket: WebSocket) {
    if (typeof message.consumer === 'string')
      this.consumers.set(socket, message.consumer);
    if (!this.clients.has(socket)) {
      this.clients.add(socket);
      socket.once('close', () => this.disconnect(socket));
      fileLog('Build connection opened', 'DevBuild', 'info', {
        consumer: this.consumers.get(socket),
      });
    }
    if (message.kind === 'ping') {
      this.send(socket, buildMessage('pong'));
      return;
    }
    const { remote } = message;
    if (!remote) return;
    const key = devBuildKey(remote);
    this.send(socket, buildMessage('hello', { diagnostics: this.diagnostics }));
    if (message.kind === 'subscribe') {
      let remotes = this.subscribers.get(socket);
      if (!remotes) this.subscribers.set(socket, (remotes = new Map()));
      if (!remotes.has(key)) this.log('Consumer subscribed', remote, socket);
      remotes.set(key, remote);
      this.state(socket, remote);
    } else if (message.kind === 'unsubscribe') {
      if (this.subscribers.get(socket)?.delete(key))
        this.log('Consumer unsubscribed', remote, socket);
    } else if (message.kind === 'result') {
      const result = message.result;
      if (
        !this.subscribers.get(socket)?.has(key) ||
        !result ||
        !['applied', 'failed'].includes(result.outcome) ||
        !['notification', 'manifest'].includes(result.trigger)
      )
        return;
      this.log(
        result.outcome === 'applied'
          ? 'Consumer applied update'
          : `Consumer update failed: ${result.error || 'Unknown error'}`,
        remote,
        socket,
        {
          outcome: result.outcome,
          trigger: result.trigger,
          buildVersion: result.buildVersion,
          operationId: result.operationId,
          stage: result.stage,
          timingsMs: result.timingsMs,
        },
        result.outcome === 'failed' ? 'error' : 'info',
      );
    } else if (message.kind === 'register') {
      this.log('Producer registered', remote, socket);
      this.publishers.set(key, {
        socket,
        remote,
        revision: randomUUID(),
      });
      this.notify(key);
    } else {
      const publisher = this.publishers.get(key);
      // A replaced or disconnected process cannot publish over its successor.
      if (!publisher || publisher.socket !== socket) return;
      let changed = true;
      if (message.kind === 'publish') {
        if (!message.publication?.buildVersion) return;
        for (const source of message.publication.sources || []) {
          devBuildKey(source);
          if (!source.buildVersion) return;
        }
        changed =
          JSON.stringify(publisher.publication) !==
          JSON.stringify(message.publication);
        publisher.publication = message.publication;
        if (changed)
          this.log('Producer build ready', remote, socket, {
            buildVersion: message.publication.buildVersion,
          });
      } else if (message.kind === 'invalidate') {
        changed = publisher.publication !== undefined;
        publisher.publication = undefined;
        if (changed) this.log('Producer build invalidated', remote, socket);
      } else return;
      publisher.revision = randomUUID();
      this.notify(key, changed);
    }
  }

  private disconnect(socket: WebSocket) {
    fileLog('Build connection closed', 'DevBuild', 'info', {
      consumer: this.consumers.get(socket),
    });
    this.clients.delete(socket);
    this.subscribers.delete(socket);
    for (const [key, publisher] of this.publishers) {
      if (publisher.socket !== socket) continue;
      this.log('Producer disconnected', publisher.remote, socket);
      this.publishers.delete(key);
      this.notify(key);
    }
    this.consumers.delete(socket);
  }
}
