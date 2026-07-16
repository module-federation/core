import {
  type ComponentType,
  useCallback,
  useRef,
  useState,
} from '@lynx-js/react';

import {
  increment,
  instanceId,
  reset,
  snapshot,
  token,
} from 'orbit-shared-state';
import type {
  ActivityEntry,
  ActivityFeedProps,
  ActivityFilter,
  RemoteCardProps,
  RemoteDetailsProps,
  SharedStateView,
} from '../remote-ui/contracts';
import {
  loadCompiledImportRemotes,
  loadRuntimeActivityFeed,
} from './federation';

export type LoadState = 'idle' | 'loading' | 'ready' | 'error';

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
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [loadError, setLoadError] = useState('');
  const [sharedState, setSharedState] = useState(snapshot());
  const [singletonShared, setSingletonShared] = useState(false);
  const [activity, setActivity] = useState(INITIAL_ACTIVITY);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [CardComponent, setCardComponent] =
    useState<ComponentType<RemoteCardProps> | null>(null);
  const [DetailsComponent, setDetailsComponent] =
    useState<ComponentType<RemoteDetailsProps> | null>(null);
  const [ActivityFeedComponent, setActivityFeedComponent] =
    useState<ComponentType<ActivityFeedProps> | null>(null);
  const validatedRef = useRef(false);

  const loadFederatedSurface = useCallback(async () => {
    'background-only';
    if (loadState === 'loading') {
      return;
    }

    setLoadState('loading');
    setLoadError('');

    try {
      const [compiled, runtime] = await Promise.all([
        loadCompiledImportRemotes(),
        loadRuntimeActivityFeed(),
      ]);

      setCardComponent(() => compiled.card.default);
      setDetailsComponent(() => compiled.details.default);
      setActivityFeedComponent(() => runtime.default);

      let nextSnapshot = snapshot();
      if (!validatedRef.current) {
        compiled.card.touchSharedState();
        nextSnapshot = compiled.details.touchSharedState();
        validatedRef.current = true;
      }

      const identityShared =
        compiled.card.sharedToken() === token &&
        compiled.details.sharedToken() === token &&
        runtime.sharedToken() === token &&
        compiled.card.sharedInstance() === instanceId &&
        compiled.details.sharedInstance() === instanceId &&
        runtime.sharedInstance() === instanceId &&
        [
          compiled.card.sharedSnapshot(),
          compiled.details.sharedSnapshot(),
          runtime.sharedSnapshot(),
        ].every(
          (remoteState) =>
            remoteState.count === nextSnapshot.count &&
            remoteState.instanceId === nextSnapshot.instanceId,
        );

      setSharedState(nextSnapshot);
      setSingletonShared(identityShared);
      setLoadState('ready');
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
          detail: "Runtime API resolved loadRemote('catalog/ActivityFeed').",
          time: 'NOW',
          title: 'Activity feed mounted',
        },
        {
          id: 'compiled-imports',
          category: 'runtime',
          detail: 'Compiled imports resolved catalog/Card and catalog/Details.',
          time: 'NOW',
          title: 'Catalog modules mounted',
        },
        {
          id: 'manifest-resolved',
          category: 'runtime',
          detail: 'mf-manifest.json resolved the remote Lynx bundle over HTTP.',
          time: 'NOW',
          title: 'Manifest resolved',
        },
        ...entries.filter((entry) => entry.id === 'boot-host'),
      ]);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
      setLoadState('error');
    }
  }, [loadState]);

  const handleHostIncrement = useCallback(() => {
    'background-only';
    increment('host/action');
    const nextSnapshot = snapshot();
    setSharedState(nextSnapshot);
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
      setSharedState(nextSnapshot);
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
    setSharedState(nextSnapshot);
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
    ActivityFeedComponent,
    CardComponent,
    DetailsComponent,
    activity,
    filter,
    handleHostIncrement,
    handleRemoteStateChange,
    handleReset,
    loadError,
    loadFederatedSurface,
    loadState,
    selectFilter,
    sharedState,
    singletonShared,
  };
}
