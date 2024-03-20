import { fileLog } from '@module-federation/dev-server';
import type { DtsWorkerOptions } from './DtsWorker';
import { exposeRpc } from '../rpc/expose-rpc';
import { RpcGMCallTypes, type RpcMessage } from '../rpc/types';
import { generateTypes } from './generateTypes';

export async function forkGenerateDts(options: DtsWorkerOptions) {
  return generateTypes(options);
}

process.on('message', (message: RpcMessage) => {
  if (message.type === RpcGMCallTypes.EXIT) {
    fileLog(
      `ChildProcess(${process.pid}) SIGTERM, Federation DevServer will exit...`,
      'ForkGenerateDts',
      'error',
    );
    process.exit(0);
  }
});

exposeRpc(forkGenerateDts);
