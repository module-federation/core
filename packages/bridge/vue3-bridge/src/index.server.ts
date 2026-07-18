import {
  createBridgeComponentWithServerRenderer,
  type ProviderFnParams,
} from './provider';
import { renderBridgeVueToString } from './server-renderer';

export function createBridgeComponent(bridgeInfo: ProviderFnParams) {
  return createBridgeComponentWithServerRenderer(
    bridgeInfo,
    renderBridgeVueToString,
  );
}

export type { ProviderFnParams } from './provider';
export { createRemoteComponent, createRemoteAppComponent } from './create';
export type { RenderFnParams } from '@module-federation/bridge-shared';
