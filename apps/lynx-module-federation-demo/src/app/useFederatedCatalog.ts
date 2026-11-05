import { useCallback, useRef, useState } from '@lynx-js/react';

import {
  increment,
  instanceId,
  reset,
  snapshot,
  token,
} from 'orbit-shared-state';
import type {
  ActivityEntry,
  ActivityFilter,
  SharedStateView,
} from '../remote-ui/contracts';
import {
  type CatalogLoadResult,
  createCatalogLoadController,
} from './catalogLoadController';
import {
  loadCompiledImportRemotes,
  loadRuntimeActivityFeed,
} from './federation';

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

type CatalogState =
  | {
      status: 'idle' | 'loading';
      sharedState: SharedStateView;
    }
  | {
      error: string;
      sharedState: SharedStateView;
      status: 'error';
    }
  | (CatalogLoadResult & { status: 'ready' });

const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: 'boot-host',
    category: 'runtime',
    detail: 'Rspeedy started the official ReactLynx host bundle.',
    time: 'NOW',
    title: 'Host launched',
  },
];

export function useFederatedCatalog() {
  const [catalogState, setCatalogState] = useState<CatalogState>({
    sharedState: snapshot(),
    status: 'idle',
  });
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const controllerRef = useRef(
    createCatalogLoadController({
      instanceId,
      loadCompiledImportRemotes,
      loadRuntimeActivityFeed,
      snapshot,
      token,
    }),
  );
  const inFlightRef = useRef<Promise<CatalogLoadResult> | null>(null);

  const loadFederatedSurface = useCallback(() => {
    'background-only';
    if (inFlightRef.current) {
      return inFlightRef.current;
    }
    if (catalogState.status === 'ready') {
      return;
    }

    setCatalogState((current) => ({
      sharedState: current.sharedState,
      status: 'loading',
    }));
    const transaction = controllerRef.current.load();
    inFlightRef.current = transaction;

    void transaction
      .then(
        (result) => {
          setCatalogState({ ...result, status: 'ready' });
          const nextSnapshot = result.sharedState;
          setActivity((entries) => [
            {
              id: `state-${nextSnapshot.revision}`,
              category: 'state',
              detail: `Host, Card, and Details share instance ${instanceId}.`,
              time: 'NOW',
              title: 'Shared counter updated',
            },
            {
              id: 'runtime-feed',
              category: 'runtime',
              detail:
                "Runtime API resolved loadRemote('catalog/ActivityFeed').",
              time: 'NOW',
              title: 'Activity feed mounted',
            },
            {
              id: 'compiled-imports',
              category: 'runtime',
              detail:
                'Compiled imports resolved catalog/Card and catalog/Details.',
              time: 'NOW',
              title: 'Catalog modules mounted',
            },
            {
              id: 'manifest-resolved',
              category: 'runtime',
              detail:
                'mf-manifest.json resolved the remote Lynx bundle over HTTP.',
              time: 'NOW',
              title: 'Manifest resolved',
            },
            ...entries.filter((entry) => entry.id === 'boot-host'),
          ]);
        },
        (error) => {
          setCatalogState((current) => ({
            error: error instanceof Error ? error.message : String(error),
            sharedState: current.sharedState,
            status: 'error',
          }));
        },
      )
      .finally(() => {
        if (inFlightRef.current === transaction) {
          inFlightRef.current = null;
        }
      });
    return transaction;
  }, [catalogState.status]);

  const handleHostIncrement = useCallback(() => {
    'background-only';
    increment('host/action');
    const nextSnapshot = snapshot();
    setCatalogState((current) => ({
      ...current,
      sharedState: nextSnapshot,
    }));
    setActivity((entries) => [
      {
        id: `increment-${nextSnapshot.revision}`,
        category: 'state',
        detail: `All singleton consumers now observe count ${nextSnapshot.count}.`,
        time: 'NOW',
        title: 'Shared counter incremented',
      },
      ...entries,
    ]);
  }, []);

  const handleRemoteStateChange = useCallback(
    (nextSnapshot: SharedStateView) => {
      'background-only';
      setCatalogState((current) => ({
        ...current,
        sharedState: nextSnapshot,
      }));
      setActivity((entries) => [
        {
          id: `increment-${nextSnapshot.revision}`,
          category: 'state',
          detail: `catalog/Card mutated the shared singleton to ${nextSnapshot.count}; every observer re-read it.`,
          time: 'NOW',
          title: 'Remote changed shared state',
        },
        ...entries,
      ]);
    },
    [],
  );

  const handleReset = useCallback(() => {
    'background-only';
    const nextSnapshot = reset();
    setCatalogState((current) => ({
      ...current,
      sharedState: nextSnapshot,
    }));
    setFilter('all');
    setActivity([
      {
        id: `reset-${nextSnapshot.revision}`,
        category: 'state',
        detail:
          'Host reset the shared singleton and cleared the activity feed.',
        time: 'NOW',
        title: 'Workspace reset',
      },
      ...INITIAL_ACTIVITY,
    ]);
  }, []);

  const selectFilter = useCallback((nextFilter: ActivityFilter) => {
    'background-only';
    setFilter(nextFilter);
  }, []);

  return {
    ActivityFeedComponent:
      catalogState.status === 'ready' ? catalogState.activityFeed : null,
    CardComponent: catalogState.status === 'ready' ? catalogState.card : null,
    DetailsComponent:
      catalogState.status === 'ready' ? catalogState.details : null,
    activity,
    filter,
    handleHostIncrement,
    handleRemoteStateChange,
    handleReset,
    loadError: catalogState.status === 'error' ? catalogState.error : '',
    loadFederatedSurface,
    loadState: catalogState.status,
    selectFilter,
    sharedState: catalogState.sharedState,
    singletonShared:
      catalogState.status === 'ready' && catalogState.singletonShared,
  };
}
