import path from 'path';
import cloneDeepWith from 'lodash.clonedeepwith';

import { type RpcWorker, createRpcWorker } from '../rpc';
import type { RpcMethod } from '../rpc/types';
import type { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import type { DTSManager } from './DTSManager';

export type DtsWorkerOptions = DTSManagerOptions;

export class DtsWorker {
  private _rpcWorker: RpcWorker<RpcMethod>;
  private _options: DtsWorkerOptions;
  private _res: Promise<any>;

  constructor(options: DtsWorkerOptions) {
    this._options = cloneDeepWith(options, (_value, key) => {
      // moduleFederationConfig.manifest may have un serialization options
      if (key === 'manifest') {
        return false;
      }
    });
    this.removeUnSerializationOptions();
    this._rpcWorker = createRpcWorker(
      path.resolve(__dirname, './forkGenerateDts.js'),
      {},
      undefined,
      true,
    );

    this._res = this._rpcWorker.connect(this._options);
    Promise.resolve(this._res).then(() => {
      this.exit();
    });
  }

  removeUnSerializationOptions() {
    if (this._options.remote?.moduleFederationConfig?.manifest) {
      delete this._options.remote?.moduleFederationConfig?.manifest;
    }
    if (this._options.host?.moduleFederationConfig?.manifest) {
      delete this._options.host?.moduleFederationConfig?.manifest;
    }
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
