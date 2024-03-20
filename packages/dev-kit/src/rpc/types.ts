export enum RpcGMCallTypes {
  CALL = 'vmok_call',
  RESOLVE = 'vmok_resolve',
  REJECT = 'vmok_reject',
  EXIT = 'vmok_exit',
}
interface RpcCallMessage {
  type: RpcGMCallTypes.CALL;
  id: string;
  args: unknown[];
}

interface RpcResolveMessage {
  type: RpcGMCallTypes.RESOLVE;
  id: string;
  value: unknown;
}
interface RpcRejectMessage {
  type: RpcGMCallTypes.REJECT;
  id: string;
  error: unknown;
}
interface RpcExitMessage {
  type: RpcGMCallTypes.EXIT;
  id: string;
}

type RpcMessage =
  | RpcCallMessage
  | RpcResolveMessage
  | RpcRejectMessage
  | RpcExitMessage;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcMethod = (...args: any[]) => any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RpcRemoteMethod<T extends RpcMethod> = T extends (
  ...args: infer A
) => infer R
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    R extends Promise<any>
    ? (...args: A) => R
    : (...args: A) => Promise<R>
  : (...args: unknown[]) => Promise<unknown>;

export type {
  RpcCallMessage,
  RpcResolveMessage,
  RpcRejectMessage,
  RpcMessage,
  RpcMethod,
  RpcRemoteMethod,
};
