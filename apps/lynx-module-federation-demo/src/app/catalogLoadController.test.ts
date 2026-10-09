import type { ComponentType } from '@lynx-js/react';
import { describe, expect, it, rs } from '@rstest/core';

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
import { createCatalogLoadController } from './catalogLoadController';

const component = <Props>(): ComponentType<Props> =>
  (() => null) as ComponentType<Props>;

const deferred = <Value>() => {
  let resolve!: (value: Value) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
};

const sharedState: SharedStateView = {
  count: 3,
  instanceId: 'shared-instance',
  lastSource: 'catalog/Details',
  revision: 2,
};

const createModules = (sharedToken: object) => {
  const observer = {
    sharedInstance: () => sharedState.instanceId,
    sharedSnapshot: () => sharedState,
    sharedToken: () => sharedToken,
  };
  const card: CardRemoteModule = {
    ...observer,
    default: component<RemoteCardProps>(),
    touchSharedState: () => sharedState,
  };
  const details: DetailsRemoteModule = {
    ...observer,
    default: component<RemoteDetailsProps>(),
    touchSharedState: () => sharedState,
  };
  const activityFeed: ActivityFeedRemoteModule = {
    ...observer,
    default: component<ActivityFeedProps>(),
  };
  return { activityFeed, card, details };
};

describe('catalog load controller', () => {
  it('shares one in-flight transaction across repeated calls', async () => {
    const sharedToken = {};
    const modules = createModules(sharedToken);
    const compiled = deferred<{
      card: CardRemoteModule;
      details: DetailsRemoteModule;
    }>();
    const runtime = deferred<ActivityFeedRemoteModule>();
    const loadCompiledImportRemotes = rs.fn(() => compiled.promise);
    const loadRuntimeActivityFeed = rs.fn(() => runtime.promise);
    const controller = createCatalogLoadController({
      instanceId: sharedState.instanceId,
      loadCompiledImportRemotes,
      loadRuntimeActivityFeed,
      snapshot: () => sharedState,
      token: sharedToken,
    });

    const first = controller.load();
    const second = controller.load();

    expect(second).toBe(first);
    expect(loadCompiledImportRemotes).toHaveBeenCalledTimes(1);
    expect(loadRuntimeActivityFeed).toHaveBeenCalledTimes(1);

    compiled.resolve({ card: modules.card, details: modules.details });
    runtime.resolve(modules.activityFeed);
    await expect(first).resolves.toMatchObject({
      activityFeed: modules.activityFeed.default,
      card: modules.card.default,
      details: modules.details.default,
      sharedState,
      singletonShared: true,
    });
  });

  it('discards partial results and retries with fresh modules', async () => {
    const sharedToken = {};
    const firstModules = createModules(sharedToken);
    const retryModules = createModules(sharedToken);
    const firstRuntime = deferred<ActivityFeedRemoteModule>();
    const failure = new Error('activity feed unavailable');
    const loadCompiledImportRemotes = rs
      .fn()
      .mockResolvedValueOnce({
        card: firstModules.card,
        details: firstModules.details,
      })
      .mockResolvedValueOnce({
        card: retryModules.card,
        details: retryModules.details,
      });
    const loadRuntimeActivityFeed = rs
      .fn<() => Promise<ActivityFeedRemoteModule>>()
      .mockImplementationOnce(() => firstRuntime.promise)
      .mockResolvedValueOnce(retryModules.activityFeed);
    const controller = createCatalogLoadController({
      instanceId: sharedState.instanceId,
      loadCompiledImportRemotes,
      loadRuntimeActivityFeed,
      snapshot: () => sharedState,
      token: sharedToken,
    });

    const first = controller.load();
    firstRuntime.reject(failure);
    await expect(first).rejects.toBe(failure);

    const retry = await controller.load();
    expect(retry.card).toBe(retryModules.card.default);
    expect(retry.details).toBe(retryModules.details.default);
    expect(retry.activityFeed).toBe(retryModules.activityFeed.default);
    expect(loadCompiledImportRemotes).toHaveBeenCalledTimes(2);
    expect(loadRuntimeActivityFeed).toHaveBeenCalledTimes(2);
  });

  it('validates singleton identity only on the first successful load', async () => {
    const sharedToken = {};
    const modules = createModules(sharedToken);
    const touchCard = rs.fn(() => sharedState);
    const touchDetails = rs.fn(() => sharedState);
    modules.card.touchSharedState = touchCard;
    modules.details.touchSharedState = touchDetails;
    const controller = createCatalogLoadController({
      instanceId: sharedState.instanceId,
      loadCompiledImportRemotes: async () => ({
        card: modules.card,
        details: modules.details,
      }),
      loadRuntimeActivityFeed: async () => modules.activityFeed,
      snapshot: () => sharedState,
      token: sharedToken,
    });

    await controller.load();
    await controller.load();

    expect(touchCard).toHaveBeenCalledTimes(1);
    expect(touchDetails).toHaveBeenCalledTimes(1);
  });
});
