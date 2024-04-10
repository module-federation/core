import type { ChildProcess } from 'child_process';

import { RpcExitError } from './rpc-error';
import { RpcRemoteMethod, RpcMessage, RpcGMCallTypes } from './types';

interface WrapRpcOptions {
  id: string;
  once?: boolean;
}

function createControlledPromise<T = unknown>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (error: unknown) => void = () => undefined;
  const promise = new Promise<T>((aResolve, aReject) => {
    resolve = aResolve;
    reject = aReject;
  });

  return {
    promise,
    resolve,
    reject,
  };
}

export function wrapRpc<T extends (...args: any[]) => any>(
  childProcess: ChildProcess,
  options: WrapRpcOptions,
): RpcRemoteMethod<T> {
  return (async (...args: unknown[]): Promise<unknown> => {
    if (!childProcess.send) {
      throw new Error(`Process ${childProcess.pid} doesn't have IPC channels`);
    } else if (!childProcess.connected) {
      throw new Error(
        `Process ${childProcess.pid} doesn't have open IPC channels`,
      );
    }
    const { id, once } = options;

    // create promises
    const {
      promise: resultPromise,
      resolve: resolveResult,
      reject: rejectResult,
    } = createControlledPromise<T>();
    const {
      promise: sendPromise,
      resolve: resolveSend,
      reject: rejectSend,
    } = createControlledPromise<void>();

    const handleMessage = (message: RpcMessage) => {
      if (message?.id === id) {
        if (message.type === RpcGMCallTypes.RESOLVE) {
          // assume the contract is respected
          resolveResult(message.value as T);
        } else if (message.type === RpcGMCallTypes.REJECT) {
          rejectResult(message.error);
        }
      }
      if (once && childProcess?.kill) {
        childProcess.kill('SIGTERM');
      }
    };
    const handleClose = (
      code: string | number | null,
      signal: string | null,
    ) => {
      rejectResult(
        new RpcExitError(
          code
            ? `Process ${childProcess.pid} exited with code ${code}${
                signal ? ` [${signal}]` : ''
              }`
            : `Process ${childProcess.pid} exited${
                signal ? ` [${signal}]` : ''
              }`,
          code,
          signal,
        ),
      );
      // declare below
      removeHandlers();
    };

    // to prevent event handler leaks
    const removeHandlers = () => {
      childProcess.off('message', handleMessage);
      childProcess.off('close', handleClose);
    };

    // add event listeners
    if (once) {
      childProcess.once('message', handleMessage);
    } else {
      childProcess.on('message', handleMessage);
    }

    childProcess.on('close', handleClose);

    // send call message
    childProcess.send(
      {
        type: RpcGMCallTypes.CALL,
        id,
        args,
      },
      (error) => {
        if (error) {
          rejectSend(error);
          removeHandlers();
        } else {
          resolveSend(undefined);
        }
      },
    );

    return sendPromise.then(() => resultPromise);
  }) as RpcRemoteMethod<T>;
}
