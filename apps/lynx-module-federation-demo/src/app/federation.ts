import type { ComponentType } from '@lynx-js/react';
import { getInstance } from '@module-federation/runtime-tools';

import type {
  ActivityFeedProps,
  RemoteCardProps,
  RemoteDetailsProps,
  SharedStateView,
} from '../remote-ui/contracts';

export interface SharedObserverExports {
  sharedInstance: () => string;
  sharedSnapshot: () => SharedStateView;
  sharedToken: () => object;
}

export interface SharedRemoteExports extends SharedObserverExports {
  touchSharedState: () => SharedStateView;
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
  'background-only';
  const [{ card }, details] = await Promise.all([
    import('./staticCard'),
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
