/** Versioned independently of the type-download and browser-reload protocol. */
export const DEV_BUILD_CHANNEL = 'mf:dev-build:v1';

export interface DevBuildRemote {
  name: string;
  /** Absolute manifest URL. Ports, paths and queries are part of the identity. */
  entry: string;
  /** Override the broker address, for example for a forwarded development port. */
  brokerUrl?: string;
}

export interface DevBuildSource extends DevBuildRemote {
  buildVersion: string;
  /** Browser artifacts have a live HMR transport. Missing means reload. */
  hot?: boolean;
}

export interface DevBuildPublication {
  buildVersion: string;
  /** Browser artifacts and applied dependencies support live HMR. */
  hot?: boolean;
  /** Retain original identities when forwarding an applied dependency update. */
  sources?: DevBuildSource[];
}

export interface DevBuildUpdate {
  remote: DevBuildRemote;
  publication: DevBuildPublication;
}

export type DevBuildStatus =
  | 'disconnected'
  | 'unsupported'
  | 'waiting'
  | 'updating'
  | 'ready';

export interface DevBuildConnectionOptions {
  publisher?: DevBuildRemote;
  remotes?: DevBuildRemote[];
  /** Only local brokers are started automatically. */
  autoStartBroker?: boolean;
}

export interface DevBuildMessage {
  type: typeof DEV_BUILD_CHANNEL;
  kind:
    | 'register'
    | 'subscribe'
    | 'unsubscribe'
    | 'publish'
    | 'invalidate'
    | 'hello'
    | 'state'
    | 'ping'
    | 'pong';
  remote?: DevBuildRemote;
  publication?: DevBuildPublication;
  revision?: string;
}

export function devBuildKey(remote: DevBuildRemote): string {
  if (!remote.name)
    throw new TypeError('A development remote name is required');
  const url = new URL(remote.entry);
  if (!['http:', 'https:'].includes(url.protocol))
    throw new TypeError('A development remote requires an HTTP manifest URL');
  if (['127.0.0.1', '[::1]'].includes(url.hostname)) url.hostname = 'localhost';
  url.hash = '';
  return JSON.stringify([remote.name, url.href]);
}

export function buildMessage(
  kind: DevBuildMessage['kind'],
  payload: Omit<DevBuildMessage, 'type' | 'kind'> = {},
): string {
  return JSON.stringify({ type: DEV_BUILD_CHANNEL, kind, ...payload });
}
