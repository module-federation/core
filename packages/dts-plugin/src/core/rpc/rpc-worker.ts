import * as child_process from 'child_process';
import type { ChildProcess, ForkOptions } from 'child_process';
import * as process from 'process';
import { randomUUID } from 'crypto';

import type { RpcMethod, RpcRemoteMethod } from './types';
import { wrapRpc } from './wrap-rpc';
import { RpcGMCallTypes } from './types';

const FEDERATION_WORKER_DATA_ENV_KEY = 'VMOK_WORKER_DATA_ENV';

interface RpcWorkerBase {
  connect(...args: unknown[]): any;
  terminate(): void;
  readonly connected: boolean;
  readonly id: string;
  readonly process: ChildProcess | undefined;
}
export type RpcWorker<T extends RpcMethod = RpcMethod> = RpcWorkerBase &
  RpcRemoteMethod<T>;

function createRpcWorker<T extends RpcMethod>(
  modulePath: string,
  data: unknown,
  memoryLimit?: number,
  once?: boolean,
): RpcWorker<T> {
  const options: ForkOptions = {
    env: {
      ...process.env,
      [FEDERATION_WORKER_DATA_ENV_KEY]: JSON.stringify(data || {}),
    },
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
    serialization: 'advanced',
  };
  if (memoryLimit) {
    options.execArgv = [`--max-old-space-size=${memoryLimit}`];
  }
  let childProcess: ChildProcess | undefined,
    remoteMethod: RpcRemoteMethod<T> | undefined;

  const id = randomUUID();

  const worker: RpcWorkerBase = {
    connect(...args: unknown[]): any {
      if (childProcess && !childProcess.connected) {
        childProcess.send({
          type: RpcGMCallTypes.EXIT,
          id,
        });
        childProcess = undefined;
        remoteMethod = undefined;
      }
      if (!childProcess?.connected) {
        childProcess = child_process.fork(modulePath, options);
        remoteMethod = wrapRpc<T>(childProcess, { id, once });
      }

      if (!remoteMethod) {
        return Promise.reject(
          new Error('Worker is not connected - cannot perform RPC.'),
        );
      }

      return remoteMethod(...args);
    },
    terminate() {
      try {
        if (childProcess.connected) {
          childProcess.send(
            {
              type: RpcGMCallTypes.EXIT,
              id,
            },
            (err) => {
              if (err) {
                console.error('Error sending message:', err);
              }
            },
          );
        }
      } catch (error) {
        if (error.code === 'EPIPE') {
          console.error('Pipe closed before message could be sent:', error);
        } else {
          console.error('Unexpected error:', error);
        }
      }
      childProcess = undefined;
      remoteMethod = undefined;
    },
    get connected() {
      return Boolean(childProcess?.connected);
    },
    get process() {
      return childProcess;
    },
    get id() {
      return id;
    },
  };

  return worker as RpcWorker<T>;
}

function getRpcWorkerData(): unknown {
  return JSON.parse(process.env[FEDERATION_WORKER_DATA_ENV_KEY] || '{}');
}

export { createRpcWorker, getRpcWorkerData };
