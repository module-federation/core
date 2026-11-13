import WebSocket from 'isomorphic-ws';
import { createBroker } from './broker/createBroker';
import {
  DEFAULT_WEB_SOCKET_PORT,
  WEB_SOCKET_CONNECT_MAGIC_ID,
} from './constant';
import {
  DEV_BUILD_CHANNEL,
  buildMessage,
  devBuildKey,
  type DevBuildConnectionOptions,
  type DevBuildMessage,
  type DevBuildPublication,
  type DevBuildRemote,
  type DevBuildStatus,
  type DevBuildUpdate,
  type DevBuildResult,
  type DevBuildDiagnostics,
} from './buildProtocol';

interface Callbacks {
  update(update: DevBuildUpdate): Promise<void>;
  status(remote: DevBuildRemote, status: DevBuildStatus): void;
  diagnostics?(diagnostics: DevBuildDiagnostics): void | Promise<void>;
}

function brokerAddress(remote: DevBuildRemote): string {
  const url = new URL(remote.brokerUrl || remote.entry);
  if (!remote.brokerUrl) {
    url.protocol = 'ws:';
    url.port = String(DEFAULT_WEB_SOCKET_PORT);
    url.pathname = '/';
    url.search = '';
    url.hash = '';
  }
  url.searchParams.set(
    'WEB_SOCKET_CONNECT_MAGIC_ID',
    WEB_SOCKET_CONNECT_MAGIC_ID,
  );
  return url.href;
}

/** Runs in the dev worker. No process-wide handlers or type generation here. */
export class BuildConnection {
  private closed = false;
  private publication?: DevBuildPublication;
  private links = new Map<
    string,
    {
      socket?: WebSocket;
      timer?: ReturnType<typeof setTimeout>;
      heartbeat?: ReturnType<typeof setInterval>;
      capable: boolean;
      diagnostics: boolean;
      alive: boolean;
      remotes: DevBuildRemote[];
      publisher?: DevBuildRemote;
    }
  >();
  private revisions = new Map<string, string | undefined>();
  private queues = new Map<string, Promise<void>>();
  private diagnosticBrokers = new Map<string, string>();

  constructor(
    private options: DevBuildConnectionOptions,
    private callbacks: Callbacks,
  ) {
    const add = (remote: DevBuildRemote, publish: boolean) => {
      devBuildKey(remote);
      const key = brokerAddress(remote);
      let link = this.links.get(key);
      if (!link) {
        link = {
          capable: false,
          diagnostics: false,
          alive: false,
          remotes: [],
        };
        this.links.set(key, link);
      }
      if (publish) link.publisher = remote;
      else link.remotes.push(remote);
    };
    if (options.publisher) add(options.publisher, true);
    for (const remote of options.remotes || []) add(remote, false);
    for (const url of this.links.keys()) this.connect(url);
  }

  private connect(url: string) {
    if (this.closed) return;
    const link = this.links.get(url)!;
    const socket = (link.socket = new WebSocket(url));
    link.capable = false;
    link.diagnostics = false;
    link.alive = true;
    const status = (value: DevBuildStatus) => {
      for (const remote of link.remotes) {
        this.revisions.delete(devBuildKey(remote));
        this.callbacks.status(remote, value);
      }
    };
    status('disconnected');
    socket.on('open', () => {
      if (link.publisher) {
        socket.send(
          buildMessage('register', {
            remote: link.publisher,
            consumer: this.options.consumer || link.publisher.name,
          }),
        );
        if (this.publication)
          socket.send(
            buildMessage('publish', {
              remote: link.publisher,
              publication: this.publication,
            }),
          );
      }
      for (const remote of link.remotes)
        socket.send(
          buildMessage('subscribe', {
            remote,
            consumer: this.options.consumer || this.options.publisher?.name,
          }),
        );
      link.heartbeat = setInterval(() => {
        if (!link.capable) status('unsupported');
        if (!link.alive) {
          socket.terminate();
          return;
        }
        link.alive = false;
        socket.send(buildMessage('ping'));
      }, 5000);
      link.heartbeat.unref?.();
    });
    socket.on('message', (data) => {
      let message: DevBuildMessage;
      try {
        message = JSON.parse(data.toString());
      } catch {
        return;
      }
      if (message?.type !== DEV_BUILD_CHANNEL) return;
      link.capable = true;
      link.alive = true;
      if (message.kind === 'hello' && message.diagnostics) {
        // Only advertise the known route on this connection's broker. A peer
        // cannot redirect diagnostics to a different origin via its handshake.
        if (
          message.diagnostics.path === '/__mf/logs' &&
          typeof message.diagnostics.brokerId === 'string'
        ) {
          link.diagnostics = true;
          const endpoint = new URL(url);
          endpoint.protocol = endpoint.protocol === 'wss:' ? 'https:' : 'http:';
          endpoint.pathname = message.diagnostics.path;
          endpoint.search = '';
          endpoint.hash = '';
          endpoint.username = '';
          endpoint.password = '';
          const address = endpoint.href;
          if (
            this.diagnosticBrokers.get(address) !== message.diagnostics.brokerId
          ) {
            this.diagnosticBrokers.set(address, message.diagnostics.brokerId);
            try {
              void Promise.resolve(
                this.callbacks.diagnostics?.({
                  brokerId: message.diagnostics.brokerId,
                  url: address,
                }),
              ).catch(() => {});
            } catch {
              // Diagnostics must never interfere with build subscriptions.
            }
          }
        }
      }
      if (message.kind !== 'state' || !message.remote) return;
      const remote = link.remotes.find(
        (value) => devBuildKey(value) === devBuildKey(message.remote!),
      );
      if (!remote) return;
      const key = devBuildKey(remote);
      this.revisions.set(key, message.revision);
      if (!message.publication) {
        this.callbacks.status(remote, 'waiting');
        return;
      }
      this.callbacks.status(remote, 'updating');
      const publication = message.publication;
      const revision = message.revision;
      const current = () =>
        !this.closed &&
        socket === link.socket &&
        socket.readyState === WebSocket.OPEN &&
        this.revisions.get(key) === revision;
      const queue = (this.queues.get(key) || Promise.resolve())
        .then(async () => {
          if (!current()) return;
          await this.callbacks.update({ remote, publication });
          if (current()) this.callbacks.status(remote, 'ready');
        })
        .catch(() => {
          if (current()) this.callbacks.status(remote, 'waiting');
        });
      this.queues.set(key, queue);
    });
    socket.on('error', (error: NodeJS.ErrnoException) => {
      const address = new URL(url);
      if (
        !this.closed &&
        this.options.autoStartBroker !== false &&
        error.code === 'ECONNREFUSED' &&
        address.protocol === 'ws:' &&
        address.pathname === '/' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(address.hostname) &&
        (address.port === String(DEFAULT_WEB_SOCKET_PORT) ||
          this.options.autoStartBroker === true)
      )
        createBroker(Number(address.port || 80));
    });
    socket.on('close', () => {
      if (link.heartbeat) clearInterval(link.heartbeat);
      status('disconnected');
      if (!this.closed) {
        link.timer = setTimeout(() => this.connect(url), 1000);
        link.timer.unref?.();
      }
    });
  }

  publish(publication: DevBuildPublication) {
    this.publication = publication;
    this.sendPublication('publish');
  }

  reportResult(remote: DevBuildRemote, result: DevBuildResult) {
    if (this.closed) return;
    try {
      const key = devBuildKey(remote);
      const link = this.links.get(brokerAddress(remote));
      if (link) {
        if (
          !link.diagnostics ||
          link.socket?.readyState !== WebSocket.OPEN ||
          !link.remotes.some((value) => devBuildKey(value) === key)
        )
          return;
        link.socket.send(buildMessage('result', { remote, result }), () => {});
      }
    } catch {
      // Best effort, with no retries or effect on the update acknowledgement.
    }
  }

  invalidate() {
    this.publication = undefined;
    this.sendPublication('invalidate');
  }

  private sendPublication(kind: 'publish' | 'invalidate') {
    for (const link of this.links.values())
      if (link.publisher && link.socket?.readyState === WebSocket.OPEN)
        link.socket.send(
          buildMessage(kind, {
            remote: link.publisher,
            publication: this.publication,
          }),
        );
  }

  close() {
    this.closed = true;
    for (const link of this.links.values()) {
      if (link.timer) clearTimeout(link.timer);
      if (link.heartbeat) clearInterval(link.heartbeat);
      link.socket?.terminate();
    }
  }
}
