export type FederationStateSource =
  | 'host'
  | 'host/action'
  | 'catalog/Card'
  | 'catalog/Details';

export interface FederationStateSnapshot {
  count: number;
  instanceId: string;
  lastSource: FederationStateSource;
  revision: number;
}

export const instanceId = `orbit-${Date.now().toString(36)}-${Math.random()
  .toString(36)
  .slice(2, 8)}`;

export const token = {};

let count = 1;
let lastSource: FederationStateSource = 'host';
let revision = 0;

export function increment(source: FederationStateSource = 'host'): number {
  count += 1;
  revision += 1;
  lastSource = source;
  return count;
}

export function reset(): FederationStateSnapshot {
  count = 0;
  revision += 1;
  lastSource = 'host';
  return snapshot();
}

export function snapshot(): FederationStateSnapshot {
  return { count, instanceId, lastSource, revision };
}
