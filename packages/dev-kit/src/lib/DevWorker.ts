import path from 'path';
import cloneDeepWith from 'lodash.clonedeepwith';
import { DTSManagerOptions } from '@module-federation/dts-kit';

import { RpcWorker, createRpcWorker } from '../rpc';
import { RpcGMCallTypes, RpcMethod } from '../rpc/types';

export interface DevWorkerOptions extends DTSManagerOptions {
  name: string;
  disableLiveReload?: boolean;
  disableGenerateTypes?: boolean;
}

export class DevWorker {
  private _rpcWorker: RpcWorker<RpcMethod>;
  private _options: DevWorkerOptions;
  private _res: Promise<any>;

  constructor(options: DevWorkerOptions) {
    this._options = cloneDeepWith(options, (_value, key) => {
      // moduleFederationConfig.manifest may have un serialization options
      if (key === 'manifest') {
        return false;
      }
    });
    this.removeUnSerializationOptions();
    this._rpcWorker = createRpcWorker(
      path.resolve(__dirname, './forkDevWorker.js'),
      {},
      undefined,
      false,
    );

    this._res = this._rpcWorker.connect(this._options);
  }

  removeUnSerializationOptions() {
    if (this._options.remote?.moduleFederationConfig?.manifest) {
      delete this._options.remote?.moduleFederationConfig?.manifest;
    }
    if (this._options.host?.moduleFederationConfig?.manifest) {
      delete this._options.host?.moduleFederationConfig?.manifest;
    }
  }

  get controlledPromise(): Promise<any> {
    return this._res;
  }

  update(): void {
    this._rpcWorker.process?.send &&
      this._rpcWorker.process.send({
        type: RpcGMCallTypes.CALL,
        id: this._rpcWorker.id,
        args: [undefined, 'update'],
      });
  }

  exit(): void {
    if (this._rpcWorker) {
      this._rpcWorker.terminate();
    }
  }
}
