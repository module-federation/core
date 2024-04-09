import path from 'path';
import cloneDeepWith from 'lodash.clonedeepwith';
import { DTSManagerOptions, rpc } from '../core/index';

export interface DevWorkerOptions extends DTSManagerOptions {
  name: string;
  disableLiveReload?: boolean;
  disableHotTypesReload?: boolean;
}

export class DevWorker {
  private _rpcWorker: rpc.RpcWorker<rpc.RpcMethod>;
  private _options: DevWorkerOptions;
  private _res: Promise<any>;

  constructor(options: DevWorkerOptions) {
    this._options = cloneDeepWith(options, (_value, key): void | any => {
      // moduleFederationConfig.manifest may have un serialization options
      if (key === 'manifest') {
        return false;
      }
    });
    this.removeUnSerializationOptions();
    this._rpcWorker = rpc.createRpcWorker(
      path.resolve(__dirname, './forkDevWorker.js'),
      {},
      undefined,
      false,
    );

    this._res = this._rpcWorker.connect(this._options);
  }

  // moduleFederationConfig.manifest may have un serialization options
  removeUnSerializationOptions() {
    delete this._options.host?.moduleFederationConfig?.manifest;
    delete this._options.remote?.moduleFederationConfig?.manifest;
  }

  get controlledPromise(): Promise<any> {
    return this._res;
  }

  update(): void {
    this._rpcWorker.process?.send?.({
      type: rpc.RpcGMCallTypes.CALL,
      id: this._rpcWorker.id,
      args: [undefined, 'update'],
    });
  }

  exit(): void {
    this._rpcWorker?.terminate();
  }
}
