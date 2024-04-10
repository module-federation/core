export enum RpcGMCallTypes {
  CALL = 'mf_call',
  RESOLVE = 'mf_resolve',
  REJECT = 'mf_reject',
  EXIT = 'mf_exit',
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
type RpcMethod = (...args: any[]) => any;

type RpcRemoteMethod<T extends RpcMethod> = T extends (
  ...args: infer A
) => infer R
  ? R extends Promise<any>
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
