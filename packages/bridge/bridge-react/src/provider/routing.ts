import type { ProviderParams } from '../types';

/** Internal render metadata, separate from application props across bundles. */
export const BRIDGE_ROUTING: unique symbol = Symbol.for('mf_bridge_routing');

export type BridgeRouting = Pick<
  ProviderParams,
  'basename' | 'memoryRoute' | 'navigation'
>;
