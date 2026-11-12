import { randomUUID } from 'crypto';
import WebSocket from 'isomorphic-ws';
import {
  buildMessage,
  devBuildKey,
  type DevBuildMessage,
  type DevBuildPublication,
  type DevBuildRemote,
} from '../buildProtocol';

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

  private notify(key: string) {
    for (const [socket, remotes] of this.subscribers) {
      const remote = remotes.get(key);
      if (remote) this.state(socket, remote);
    }
  }

  handle(message: DevBuildMessage, socket: WebSocket) {
    if (!this.clients.has(socket)) {
      this.clients.add(socket);
      socket.once('close', () => this.disconnect(socket));
    }
    if (message.kind === 'ping') {
      this.send(socket, buildMessage('pong'));
      return;
    }
    const { remote } = message;
    if (!remote) return;
    const key = devBuildKey(remote);
    this.send(socket, buildMessage('hello'));
    if (message.kind === 'subscribe') {
      let remotes = this.subscribers.get(socket);
      if (!remotes) this.subscribers.set(socket, (remotes = new Map()));
      remotes.set(key, remote);
      this.state(socket, remote);
    } else if (message.kind === 'unsubscribe') {
      this.subscribers.get(socket)?.delete(key);
    } else if (message.kind === 'register') {
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
      if (message.kind === 'publish') {
        if (!message.publication?.buildVersion) return;
        for (const source of message.publication.sources || []) {
          devBuildKey(source);
          if (!source.buildVersion) return;
        }
        publisher.publication = message.publication;
      } else if (message.kind === 'invalidate') {
        publisher.publication = undefined;
      } else return;
      publisher.revision = randomUUID();
      this.notify(key);
    }
  }

  private disconnect(socket: WebSocket) {
    this.clients.delete(socket);
    this.subscribers.delete(socket);
    for (const [key, publisher] of this.publishers) {
      if (publisher.socket !== socket) continue;
      this.publishers.delete(key);
      this.notify(key);
    }
  }
}
