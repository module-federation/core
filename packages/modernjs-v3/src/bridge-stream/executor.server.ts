import type {
  BridgeProvider,
  BridgeSSRRequest,
  BridgeSSRMessageResult,
} from '@module-federation/bridge-react/ssr';
import type { BridgeServiceOptions } from '../types';
import { fetchBridgeService } from './service-http';

/** Once a result is returned, stream failures belong to the CSR recovery path. */
export async function executeBridgeSSR(
  info: BridgeSSRRequest,
  factory: () => BridgeProvider | Promise<BridgeProvider>,
  service?: BridgeServiceOptions,
): Promise<BridgeSSRMessageResult> {
  if (service) {
    try {
      return await fetchBridgeService(info, {
        ...service,
        hydrationMode: 'progressive',
      });
    } catch (error) {
      if (!service.localFallback || info.signal.aborted) throw error;
    }
  }
  if (info.signal.aborted) throw info.signal.reason;
  const provider = await factory();
  if (info.signal.aborted) throw info.signal.reason;
  if (!provider.renderStream)
    throw Error(
      `Bridge provider ${info.moduleName || info.instanceId} does not support SSR`,
    );
  const result = await provider.renderStream(info);
  if (service && result.revision !== service.revision) {
    result.snapshot.catch(() => {});
    if (typeof result.hydration === 'object')
      result.hydration.snapshot.catch(() => {});
    result.abort(Error('Local Bridge fallback build revision mismatch'));
    throw Error('Local Bridge fallback build revision mismatch');
  }
  if (!('protocol' in result) || result.protocol !== 'mf-bridge-producer/1') {
    const reason = Error(
      'Bridge SSR requires producer-prepared messages. Rebuild the producer with the current server adapter.',
    );
    result.snapshot.catch(() => {});
    if (typeof result.hydration === 'object')
      result.hydration.snapshot.catch(() => {});
    result.abort(reason);
    throw reason;
  }
  return result;
}
