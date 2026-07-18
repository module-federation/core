import type { CSSProperties } from 'react';

export const BRIDGE_SSR_PROTOCOL_VERSION = 1 as const;

export type BridgeJSONValue =
  | null
  | boolean
  | number
  | string
  | BridgeJSONValue[]
  | { [key: string]: BridgeJSONValue };

export type BridgeSSRPrepareResult<P = Record<string, unknown>> = {
  props?: P;
  dehydratedState?: BridgeJSONValue;
};

export type BridgeSSRConfig<P = Record<string, unknown>> =
  | boolean
  | {
      prepare?: (
        context: BridgeServerRenderContext<P>,
      ) =>
        | void
        | BridgeSSRPrepareResult<P>
        | Promise<void | BridgeSSRPrepareResult<P>>;
      hydrate?: (
        state: BridgeJSONValue | undefined,
      ) => Partial<P> | Record<string, unknown>;
    };

export type BridgeServerRenderContext<P = Record<string, unknown>> = {
  moduleName: string;
  instanceId: string;
  request: Request;
  signal: AbortSignal;
  props: P;
};

export type BridgeSSRResult = {
  protocolVersion: typeof BRIDGE_SSR_PROTOCOL_VERSION;
  moduleName: string;
  instanceId: string;
  html: string;
  dehydratedState?: BridgeJSONValue;
};

export class BridgeSSRError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'BridgeSSRError';
    this.cause = cause;
  }
}

export interface ProviderParams {
  moduleName?: string;
  basename?: string;
  memoryRoute?: { entryPath: string };
  hashRoute?: boolean;
  style?: CSSProperties;
  className?: string;
}

export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
  instanceId?: string;
  ssrState?: BridgeJSONValue;
  signal?: AbortSignal;
}

export interface BridgeProviderAPI {
  render: (info: RenderFnParams) => void | Promise<void>;
  destroy: (info: { dom: HTMLElement }) => void;
  renderServer?: (
    context: BridgeServerRenderContext,
  ) => Promise<BridgeSSRResult>;
}
