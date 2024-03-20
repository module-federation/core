import path from 'path';
import { type RpcWorker, createRpcWorker } from '../rpc';
import type { RpcMethod } from '../rpc/types';
import type { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import type { DTSManager } from './DTSManager';

export type DtsWorkerOptions = DTSManagerOptions;

export class DtsWorker {
  private _rpcWorker: RpcWorker<RpcMethod>;
  private _options: DtsWorkerOptions;
  private _res: Promise<any>;
  private _extraOptions: Record<string, any>;

  constructor(options: DtsWorkerOptions, extraOptions?: Record<string, any>) {
    this._options = options;
    this._extraOptions = extraOptions || {};

    this._rpcWorker = createRpcWorker(
      path.resolve(__dirname, './forkGenerateDts.js'),
      {},
      undefined,
      true,
    );

    this._res = this._rpcWorker.connect(this._options, this._extraOptions);
    Promise.resolve(this._res).then(() => {
      this.exit();
    });
  }

  get controlledPromise(): ReturnType<DTSManager['generateTypes']> {
    return this._res as unknown as ReturnType<DTSManager['generateTypes']>;
  }

  exit(): void {
    if (this._rpcWorker) {
      this._rpcWorker.terminate();
    }
  }
}
