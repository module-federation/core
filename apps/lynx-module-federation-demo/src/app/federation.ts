import type { ComponentType } from '@lynx-js/react';
import { getInstance } from '@module-federation/runtime-tools';

import type {
  ActivityFeedProps,
  RemoteCardProps,
  RemoteDetailsProps,
} from '../remote-ui/contracts';

export interface SharedObserverExports {
  sharedInstance: () => string;
  sharedSnapshot: () => { count: number; instanceId: string };
  sharedToken: () => object;
}

export interface SharedRemoteExports extends SharedObserverExports {
  touchSharedState: () => { count: number; instanceId: string };
}

export interface CardRemoteModule extends SharedRemoteExports {
  default: ComponentType<RemoteCardProps>;
}

export interface DetailsRemoteModule extends SharedRemoteExports {
  default: ComponentType<RemoteDetailsProps>;
}

export interface ActivityFeedRemoteModule extends SharedObserverExports {
  default: ComponentType<ActivityFeedProps>;
}

export async function loadCompiledImportRemotes() {
  const [card, details] = await Promise.all([
    import('catalog/Card'),
    import('catalog/Details'),
  ]);

  return { card, details };
}

export async function loadRuntimeActivityFeed() {
  const instance = getInstance(
    (candidate) => candidate.name === 'orbit_control',
  );
  if (!instance) {
    throw new Error('The orbit_control federation instance is unavailable.');
  }

  const activityFeed = await instance.loadRemote<ActivityFeedRemoteModule>(
    'catalog/ActivityFeed',
  );

  if (!activityFeed) {
    throw new Error('catalog/ActivityFeed returned no module.');
  }

  return activityFeed;
}
