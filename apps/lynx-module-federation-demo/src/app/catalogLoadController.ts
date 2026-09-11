import type { ComponentType } from '@lynx-js/react';

import type {
  ActivityFeedProps,
  RemoteCardProps,
  RemoteDetailsProps,
  SharedStateView,
} from '../remote-ui/contracts';
import type {
  ActivityFeedRemoteModule,
  CardRemoteModule,
  DetailsRemoteModule,
} from './federation';

export interface CatalogLoadResult {
  activityFeed: ComponentType<ActivityFeedProps>;
  card: ComponentType<RemoteCardProps>;
  details: ComponentType<RemoteDetailsProps>;
  sharedState: SharedStateView;
  singletonShared: boolean;
}

interface CatalogLoadControllerDependencies {
  instanceId: string;
  loadCompiledImportRemotes(): Promise<{
    card: CardRemoteModule;
    details: DetailsRemoteModule;
  }>;
  loadRuntimeActivityFeed(): Promise<ActivityFeedRemoteModule>;
  snapshot(): SharedStateView;
  token: object;
}

const sharesSingleton = (
  modules: {
    activityFeed: ActivityFeedRemoteModule;
    card: CardRemoteModule;
    details: DetailsRemoteModule;
  },
  sharedState: SharedStateView,
  instanceId: string,
  token: object,
): boolean =>
  modules.card.sharedToken() === token &&
  modules.details.sharedToken() === token &&
  modules.activityFeed.sharedToken() === token &&
  modules.card.sharedInstance() === instanceId &&
  modules.details.sharedInstance() === instanceId &&
  modules.activityFeed.sharedInstance() === instanceId &&
  [
    modules.card.sharedSnapshot(),
    modules.details.sharedSnapshot(),
    modules.activityFeed.sharedSnapshot(),
  ].every(
    (remoteState) =>
      remoteState.count === sharedState.count &&
      remoteState.instanceId === sharedState.instanceId,
  );

export const createCatalogLoadController = ({
  instanceId,
  loadCompiledImportRemotes,
  loadRuntimeActivityFeed,
  snapshot,
  token,
}: CatalogLoadControllerDependencies) => {
  let inFlight: Promise<CatalogLoadResult> | undefined;
  let validatedSingleton: boolean | undefined;

  const runTransaction = async (): Promise<CatalogLoadResult> => {
    const [compiled, activityFeed] = await Promise.all([
      loadCompiledImportRemotes(),
      loadRuntimeActivityFeed(),
    ]);

    let sharedState = snapshot();
    if (validatedSingleton === undefined) {
      compiled.card.touchSharedState();
      sharedState = compiled.details.touchSharedState();
      validatedSingleton = sharesSingleton(
        { activityFeed, ...compiled },
        sharedState,
        instanceId,
        token,
      );
    }

    return {
      activityFeed: activityFeed.default,
      card: compiled.card.default,
      details: compiled.details.default,
      sharedState,
      singletonShared: validatedSingleton,
    };
  };

  return {
    load(): Promise<CatalogLoadResult> {
      if (inFlight) {
        return inFlight;
      }

      const transaction = runTransaction();
      const tracked = transaction.finally(() => {
        if (inFlight === tracked) {
          inFlight = undefined;
        }
      });
      inFlight = tracked;
      return tracked;
    },
  };
};
