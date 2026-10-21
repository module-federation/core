export * from '@module-federation/bridge-react/server';
import {
  createBridgeComponent as createProvider,
  type ProviderFnParams,
} from '@module-federation/bridge-react/server';
import { normalizeBridgeSSR } from '../bridge-stream/producer.server';

/** The Node producer owns framing; framework callbacks still return raw bytes. */
export function createBridgeComponent<T>(options: ProviderFnParams<T>) {
  const factory = createProvider(options);
  return () => {
    const provider = factory();
    if (!provider.renderStream) return provider;
    const render = provider.renderStream.bind(provider);
    return {
      ...provider,
      renderStream: async (info: Parameters<typeof render>[0]) =>
        normalizeBridgeSSR(await render(info), info),
    };
  };
}
