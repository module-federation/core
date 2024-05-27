import type { registerRemotes } from '@module-federation/runtime';
import crypto from 'crypto';

type RegisterRemotesOptions = Parameters<typeof registerRemotes>;

type Remote = RegisterRemotesOptions[0][0];
type RegisterRemoteOption = RegisterRemotesOptions[1];

const STATUS_CALC_HASH = 1;
const STATUS_NEED_RELOAD = 0;

type RemoteMap = {
  [remoteName: string]: {
    entry: string;
    lastRegisterTime: number;
    status?: number;
    remoteEntryHash?: string;
  };
};

const remoteMap: RemoteMap = {};
const DEFAULT_EXPIRED_TIME = 5 * 60 * 1000;

async function calcRemoteEntryHash(entry: string) {
  return globalThis
    .fetch(entry)
    .then((res) => res.text())
    .then((entryContent) => {
      const hash = crypto.createHash('sha256');
      hash.update(entryContent);
      return hash.digest('hex');
    });
}

export function flushDynamicRemote({
  remote,
  options = {},
  expiredTime = DEFAULT_EXPIRED_TIME,
}: {
  remote: Remote;
  options?: RegisterRemoteOption;
  expiredTime?: number;
}): boolean | void {
  if (!('entry' in remote) || options.force) {
    return;
  }

  const { name } = remote;

  if (!remoteMap[name]) {
    remoteMap[name] = {
      entry: remote.entry,
      lastRegisterTime: Date.now(),
      status: STATUS_CALC_HASH,
    };
    setImmediate(() => {
      calcRemoteEntryHash(remote.entry).then((hash) => {
        remoteMap[name].status = undefined;
        remoteMap[name].remoteEntryHash = hash;
      });
    });
    return;
  }

  const remoteInfo = remoteMap[name];

  if (remoteInfo.status === STATUS_CALC_HASH) {
    return;
  }

  if (remoteInfo.status === STATUS_NEED_RELOAD) {
    remoteInfo.lastRegisterTime = Date.now();
    remoteInfo.entry = remote.entry;
    remoteInfo.status = undefined;
    return true;
  }

  if (Date.now() - remoteInfo.lastRegisterTime < expiredTime) {
    return;
  }

  remoteInfo.status = STATUS_CALC_HASH;

  setImmediate(() => {
    calcRemoteEntryHash(remote.entry).then((hash) => {
      if (remoteInfo.remoteEntryHash !== hash) {
        remoteInfo.remoteEntryHash = hash;
        remoteInfo.status = STATUS_NEED_RELOAD;
      } else {
        remoteInfo.status = undefined;
        remoteInfo.lastRegisterTime = Date.now();
      }
    });
  });
}
