import { exposeRpc } from '../rpc/expose-rpc';
import { fileLog } from '@module-federation/dev-server';
import { RpcGMCallTypes, RpcMessage } from '../rpc/types';
import { DtsWorkerOptions } from './DtsWorker';
import { generateTypes } from './generateTypes';

export async function forkGenerateTypes(
  options: DtsWorkerOptions,
): Promise<void> {
  await generateTypes(options);
}

process.on('message', (message: RpcMessage) => {
  if (message.type === RpcGMCallTypes.EXIT) {
    fileLog(
      `ChildProcess(${process.pid}) SIGTERM, Vmok DevServer will exit...`,
      'ForkGenerateTypes',
      'error',
    );
    process.exit(0);
  }
});

exposeRpc(forkGenerateTypes);
