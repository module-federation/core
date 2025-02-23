import type { DtsWorkerOptions } from './DtsWorker';
import { exposeRpc } from '../rpc/expose-rpc';
import { RpcGMCallTypes, type RpcMessage } from '../rpc/types';
import { generateTypes } from './generateTypes';

export async function forkGenerateDts(
  options: DtsWorkerOptions,
  generateTypesOptions?: { consumeTypes?: boolean },
) {
  return generateTypes(options, generateTypesOptions);
}

process.on('message', (message: RpcMessage) => {
  if (message.type === RpcGMCallTypes.EXIT) {
    process.exit(0);
  }
});

exposeRpc(forkGenerateDts);
