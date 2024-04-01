import process from 'process';
import { RpcGMCallTypes } from './types';
import type { RpcMessage } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exposeRpc(fn: (...args: any[]) => any) {
  const sendMessage = (message: RpcMessage) =>
    new Promise<void>((resolve, reject) => {
      if (!process.send) {
        reject(new Error(`Process ${process.pid} doesn't have IPC channels`));
      } else if (!process.connected) {
        reject(
          new Error(`Process ${process.pid} doesn't have open IPC channels`),
        );
      } else {
        process.send(message, undefined, undefined, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(undefined);
          }
        });
      }
    });
  const handleMessage = async (message: RpcMessage) => {
    if (message.type === RpcGMCallTypes.CALL) {
      if (!process.send) {
        // process disconnected - skip
        return;
      }

      try {
        const value = await fn(...message.args);
        await sendMessage({
          type: RpcGMCallTypes.RESOLVE,
          id: message.id,
          value,
        });
      } catch (fnError) {
        try {
          await sendMessage({
            type: RpcGMCallTypes.REJECT,
            id: message.id,
            error: fnError,
          });
        } catch (err) {
          if (fnError instanceof Error) {
            console.error(fnError);
          }
          console.error(err);
        }
      }
    }
  };
  process.on('message', handleMessage);
}
