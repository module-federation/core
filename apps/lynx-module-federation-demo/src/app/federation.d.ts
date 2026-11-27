declare module 'orbit-shared-state' {
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

  export const instanceId: string;
  export const token: object;
  export function increment(source?: FederationStateSource): number;
  export function reset(): FederationStateSnapshot;
  export function snapshot(): FederationStateSnapshot;
}

declare module 'catalog/Card' {
  const Card: import('@lynx-js/react').ComponentType<
    import('../remote-ui/contracts.js').RemoteCardProps
  >;
  export const sharedInstance: () => string;
  export const sharedSnapshot: typeof import('../shared-app/federationState.js').snapshot;
  export const sharedToken: () => object;
  export const touchSharedState: typeof import('../shared-app/federationState.js').snapshot;
  export default Card;
}

declare module 'catalog/Details' {
  const Details: import('@lynx-js/react').ComponentType<
    import('../remote-ui/contracts.js').RemoteDetailsProps
  >;
  export const sharedInstance: () => string;
  export const sharedSnapshot: typeof import('../shared-app/federationState.js').snapshot;
  export const sharedToken: () => object;
  export const touchSharedState: typeof import('../shared-app/federationState.js').snapshot;
  export default Details;
}

declare module 'catalog/ActivityFeed' {
  const ActivityFeed: import('@lynx-js/react').ComponentType<
    import('../remote-ui/contracts.js').ActivityFeedProps
  >;
  export const sharedInstance: () => string;
  export const sharedSnapshot: typeof import('../shared-app/federationState.js').snapshot;
  export const sharedToken: () => object;
  export default ActivityFeed;
}
