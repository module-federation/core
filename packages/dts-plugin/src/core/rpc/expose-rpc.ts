import process from 'process';
import { RpcGMCallTypes } from './types';
import type { RpcMessage } from './types';

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

      let value: unknown, error: unknown;
      try {
        value = await fn(...message.args);
      } catch (fnError) {
        error = fnError;
      }

      try {
        if (error) {
          await sendMessage({
            type: RpcGMCallTypes.REJECT,
            id: message.id,
            error,
          });
        } else {
          await sendMessage({
            type: RpcGMCallTypes.RESOLVE,
            id: message.id,
            value,
          });
        }
      } catch (sendError) {
        // we can't send things back to the parent process - let's use stdout to communicate error
        if (error) {
          if (error instanceof Error) {
            console.error(error);
          }
        }
        console.error(sendError);
      }
    }
  };
  process.on('message', handleMessage);
}
