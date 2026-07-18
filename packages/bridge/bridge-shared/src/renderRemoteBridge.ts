import { assertBridgeSSRIdentity, assertBridgeSSRResult } from './ssr';
import {
  BridgeSSRError,
  type BridgeServerRenderContext,
  type BridgeSSRResult,
} from './type';

export type RenderRemoteBridgeOptions<P = Record<string, unknown>> = {
  loader: () => Promise<Record<string, unknown>>;
  export?: string;
  moduleName: string;
  instanceId: string;
  request: Request;
  props?: P;
};

export async function renderRemoteBridge<P = Record<string, unknown>>(
  options: RenderRemoteBridgeOptions<P>,
): Promise<BridgeSSRResult> {
  if (typeof window !== 'undefined' || typeof document !== 'undefined') {
    throw new BridgeSSRError(
      'renderRemoteBridge can only be called in a server environment',
    );
  }
  if (!(options.request instanceof Request)) {
    throw new BridgeSSRError('Bridge SSR requires a standard Request');
  }
  assertBridgeSSRIdentity(options);
  if (options.request.signal.aborted) {
    throw new BridgeSSRError(
      `Bridge SSR request for ${options.moduleName} was aborted`,
      options.request.signal.reason,
    );
  }

  let remoteModule: Record<string, unknown>;
  try {
    remoteModule = await options.loader();
  } catch (error) {
    throw new BridgeSSRError(
      `Unable to load Bridge remote ${options.moduleName}`,
      error,
    );
  }

  const exportName = options.export ?? 'default';
  const factory = remoteModule[exportName];
  if (typeof factory !== 'function') {
    throw new BridgeSSRError(
      `Bridge remote ${options.moduleName} does not export ${exportName}`,
    );
  }

  const provider = factory() as {
    renderServer?: (
      context: BridgeServerRenderContext<P>,
    ) => Promise<BridgeSSRResult>;
  };
  if (typeof provider?.renderServer !== 'function') {
    throw new BridgeSSRError(
      `Bridge remote ${options.moduleName} does not support server rendering`,
    );
  }

  let result: BridgeSSRResult;
  try {
    result = await provider.renderServer({
      moduleName: options.moduleName,
      instanceId: options.instanceId,
      request: options.request,
      signal: options.request.signal,
      props: (options.props ?? {}) as P,
    });
  } catch (error) {
    if (error instanceof BridgeSSRError) throw error;
    throw new BridgeSSRError(
      `Unable to render Bridge remote ${options.moduleName}`,
      error,
    );
  }

  assertBridgeSSRResult(result);
  if (
    result.moduleName !== options.moduleName ||
    result.instanceId !== options.instanceId
  ) {
    throw new BridgeSSRError(
      `Bridge remote ${options.moduleName} returned mismatched identity`,
    );
  }
  return result;
}
