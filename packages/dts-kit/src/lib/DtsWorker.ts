import { createRpcWorker, RpcWorker } from '../rpc';
import path from 'path';
import { RpcMethod } from '../rpc/types';
import { DTSManagerOptions } from '../interfaces/DTSManagerOptions';

export type DtsWorkerOptions = DTSManagerOptions;

export class DtsWorker {
  private _rpcWorker: RpcWorker<RpcMethod>;
  private _options: DtsWorkerOptions;
  private _res: Promise<any>;

  constructor(options: DtsWorkerOptions) {
    this._options = options;

    this._rpcWorker = createRpcWorker(
      path.resolve(__dirname, './forkGenerateTypes.js'),
      {},
      undefined,
      true,
    );

    this._res = this._rpcWorker.connect(this._options);
    Promise.resolve(this._res).then(() => {
      this.exit();
    });
  }

  get controlledPromise(): Promise<any> {
    return this._res;
  }

  exit(): void {
    if (this._rpcWorker) {
      this._rpcWorker.terminate();
    }
  }
}
