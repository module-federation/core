import path from 'path';
import cloneDeepWith from 'lodash.clonedeepwith';

import { type RpcWorker, createRpcWorker } from '../rpc/index';
import type { RpcMethod } from '../rpc/types';
import type { DTSManagerOptions } from '../interfaces/DTSManagerOptions';
import type { DTSManager } from './DTSManager';

export type DtsWorkerOptions = DTSManagerOptions;

export class DtsWorker {
  rpcWorker: RpcWorker<RpcMethod>;
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
    this.rpcWorker = createRpcWorker(
      path.resolve(__dirname, './forkGenerateDts.js'),
      {},
      undefined,
      true,
    );

    this._res = this.rpcWorker.connect(this._options);
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
    return Promise.resolve(this._res).then(() => {
      this.exit();
    });
  }

  exit(): void {
    this.rpcWorker?.terminate();
  }
}
