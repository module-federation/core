import {
  createBridgeRouterConnector,
  type BridgeRouterAdapter,
  type BridgeRouterLocation,
  type BridgeRouterSnapshot,
} from '../../bridge-shared/src/router';

const tick = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

function fixture(initial?: Partial<BridgeRouterSnapshot>) {
  let snapshot: BridgeRouterSnapshot = {
    location: { url: '/inventory/1', key: 'one' },
    action: 'POP',
    initialized: true,
    ...initial,
  };
  let history: BridgeRouterLocation = { ...snapshot.location };
  let hostLocation = history.url;
  const routerListeners = new Set<() => void>();
  const hostListeners = new Set<() => void>();
  const navigation = {
    getLocation: jest.fn(() => hostLocation),
    subscribe: jest.fn((listener: () => void) => {
      hostListeners.add(listener);
      return () => hostListeners.delete(listener);
    }),
  };
  const publishRouter = () => {
    for (const listener of routerListeners) listener();
  };
  const adapter: BridgeRouterAdapter = {
    getSnapshot: jest.fn(() => snapshot),
    subscribe: jest.fn((listener) => {
      routerListeners.add(listener);
      return () => routerListeners.delete(listener);
    }),
    getHistoryLocation: jest.fn(() => history),
    syncFromHistory: jest.fn(() => {
      snapshot = { ...snapshot, pendingLocation: { ...history } };
      publishRouter();
    }),
    notifyPeers: jest.fn(publishRouter),
  };
  return {
    adapter,
    navigation,
    routerListeners,
    hostListeners,
    snapshot: () => snapshot,
    history: () => history,
    setSnapshot(next: BridgeRouterSnapshot) {
      snapshot = next;
      publishRouter();
    },
    setHistory(next: BridgeRouterLocation) {
      history = next;
    },
    hostMove(url: string) {
      hostLocation = url;
      for (const listener of hostListeners) listener();
    },
  };
}

describe('shared Bridge Router connector', () => {
  it('attaches without synchronously reading or notifying a Router', async () => {
    const value = fixture();
    const connector = createBridgeRouterConnector({ onError: jest.fn() });
    connector.attach(value.adapter);
    expect(value.adapter.getSnapshot).not.toHaveBeenCalled();
    expect(value.adapter.notifyPeers).not.toHaveBeenCalled();
    await tick();
    expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
    expect(value.adapter.notifyPeers).not.toHaveBeenCalled();
    connector.dispose();
  });

  it.each(['none', 'browser', 'stale'])(
    'notifies an initial redirect once with a %s Host adapter',
    async (host) => {
      const value = fixture({ action: 'REPLACE' });
      if (host === 'stale') value.hostMove('/inventory/start');
      const connector = createBridgeRouterConnector({
        navigation: host === 'none' ? undefined : value.navigation,
        onError: jest.fn(),
      });
      connector.attach(value.adapter);
      await tick();
      connector.attach(value.adapter);
      connector.setNavigation(host === 'none' ? undefined : value.navigation);
      await tick();
      expect(value.adapter.notifyPeers).toHaveBeenCalledTimes(1);
      expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
      connector.dispose();
    },
  );

  it('does not cancel initial loading or an unrelated pending navigation merely on attach', async () => {
    for (const initialized of [false, true]) {
      const value = fixture({
        initialized,
        pendingLocation: { url: '/inventory/2', key: 'two' },
      });
      const connector = createBridgeRouterConnector({
        navigation: value.navigation,
        onError: jest.fn(),
      });
      connector.attach(value.adapter);
      await tick();
      expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
      expect(value.adapter.notifyPeers).not.toHaveBeenCalled();
      connector.dispose();
    }
  });

  it('notifies peers once for a completed push or same-URL replace', async () => {
    const value = fixture();
    const connector = createBridgeRouterConnector({ onError: jest.fn() });
    connector.attach(value.adapter);
    await tick();
    for (const action of ['PUSH', 'REPLACE'] as const) {
      const location = { url: '/inventory/2?tab=a#detail', key: action };
      value.setHistory(location);
      value.setSnapshot({ location, action, initialized: true });
      await tick();
    }
    expect(value.adapter.notifyPeers).toHaveBeenCalledTimes(2);
    expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
    connector.dispose();
  });

  it.each(['none', 'subscribed'])(
    'notifies a committed entry while the next navigation is pending (%s Host)',
    async (host) => {
      const value = fixture();
      const connector = createBridgeRouterConnector({
        navigation: host === 'none' ? undefined : value.navigation,
        onError: jest.fn(),
      });
      connector.attach(value.adapter);
      await tick();
      const location = { url: '/inventory/2', key: 'two' };
      value.setHistory(location);
      value.setSnapshot({
        location,
        action: 'PUSH',
        initialized: true,
        pendingLocation: { url: '/inventory/slow', key: 'slow' },
      });
      await tick();
      expect(value.adapter.notifyPeers).toHaveBeenCalledTimes(1);
      expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
      // The Host may finish its own loader later and echo the already committed
      // entry. That is not a request to cancel the newer Remote navigation.
      value.hostMove(location.url);
      await tick();
      expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
      expect(value.snapshot().pendingLocation?.key).toBe('slow');
      connector.dispose();
    },
  );

  it('does not restart a loader already processing the native POP target and entry key', async () => {
    const value = fixture();
    const connector = createBridgeRouterConnector({
      navigation: value.navigation,
      onError: jest.fn(),
    });
    connector.attach(value.adapter);
    await tick();
    const back = { url: '/inventory/previous', key: 'previous' };
    value.setHistory(back);
    value.setSnapshot({ ...value.snapshot(), pendingLocation: back });
    value.hostMove(back.url);
    await tick();
    expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
    value.setSnapshot({ location: back, action: 'POP', initialized: true });
    await tick();
    expect(value.adapter.notifyPeers).not.toHaveBeenCalled();
    connector.dispose();
  });

  it.each(['/outside', '/inventory/1'])(
    'cancels a different in-flight target after a Host move to %s',
    async (url) => {
      const value = fixture();
      const connector = createBridgeRouterConnector({
        navigation: value.navigation,
        onError: jest.fn(),
      });
      connector.attach(value.adapter);
      await tick();
      value.setSnapshot({
        ...value.snapshot(),
        pendingLocation: { url: '/inventory/slow', key: 'slow' },
      });
      value.setHistory({ url, key: 'host-new' });
      value.hostMove(url);
      await tick();
      expect(value.adapter.syncFromHistory).toHaveBeenCalledTimes(1);
      expect(value.adapter.notifyPeers).not.toHaveBeenCalled();
      connector.dispose();
    },
  );

  it('distinguishes a pending same-URL navigation from a new history entry', async () => {
    const value = fixture();
    const connector = createBridgeRouterConnector({
      navigation: value.navigation,
      onError: jest.fn(),
    });
    connector.attach(value.adapter);
    await tick();
    value.setSnapshot({
      ...value.snapshot(),
      pendingLocation: { url: '/inventory/1', key: 'remote-new' },
    });
    value.setHistory({
      url: '/inventory/1',
      key: 'host-new',
    });
    value.hostMove('/inventory/1');
    await tick();
    expect(value.adapter.syncFromHistory).toHaveBeenCalledTimes(1);
    connector.dispose();
  });

  it('does not interpret a stale Host snapshot as a browser write', async () => {
    const value = fixture();
    const connector = createBridgeRouterConnector({
      navigation: value.navigation,
      onError: jest.fn(),
    });
    connector.attach(value.adapter);
    await tick();
    value.setSnapshot({
      ...value.snapshot(),
      pendingLocation: { url: '/inventory/slow', key: 'slow' },
    });
    value.hostMove('/not-in-browser-yet');
    await tick();
    expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
    connector.dispose();
  });

  it('keeps the current subscription and does no work for the same navigation reference', async () => {
    const value = fixture();
    const connector = createBridgeRouterConnector({
      navigation: value.navigation,
      onError: jest.fn(),
    });
    connector.attach(value.adapter);
    await tick();
    const reads = jest.mocked(value.adapter.getSnapshot).mock.calls.length;
    connector.setNavigation(value.navigation);
    await tick();
    expect(value.adapter.getSnapshot).toHaveBeenCalledTimes(reads);
    expect(value.navigation.subscribe).toHaveBeenCalledTimes(1);
    expect(value.adapter.subscribe).toHaveBeenCalledTimes(1);
    connector.dispose();
  });

  it('replaces a mount with a new connection and drops the old queued work', async () => {
    const previous = fixture({
      location: { url: '/stores/100/inventory', key: 'old-mount' },
      action: 'PUSH',
    });
    const next = fixture({
      location: { url: '/stores/200/inventory', key: 'new-mount' },
    });
    const oldConnection = createBridgeRouterConnector({
      navigation: previous.navigation,
      onError: jest.fn(),
    });
    oldConnection.attach(previous.adapter);
    oldConnection.dispose();
    const connection = createBridgeRouterConnector({
      navigation: next.navigation,
      onError: jest.fn(),
    });
    connection.attach(next.adapter);
    await tick();
    expect(previous.routerListeners.size).toBe(0);
    expect(previous.hostListeners.size).toBe(0);
    expect(previous.adapter.getSnapshot).not.toHaveBeenCalled();
    expect(previous.adapter.notifyPeers).not.toHaveBeenCalled();
    expect(next.routerListeners.size).toBe(1);
    expect(next.hostListeners.size).toBe(1);
    expect(next.adapter.syncFromHistory).not.toHaveBeenCalled();
    connection.dispose();
  });

  it('drops a queued Remote notification when the Host has already changed history', async () => {
    const value = fixture();
    const connector = createBridgeRouterConnector({
      navigation: value.navigation,
      onError: jest.fn(),
    });
    connector.attach(value.adapter);
    await tick();
    const location = { url: '/inventory/2', key: 'two' };
    value.setHistory(location);
    value.setSnapshot({ location, action: 'PUSH', initialized: true });
    value.setHistory({
      url: '/outside',
      key: 'outside',
    });
    value.hostMove('/outside');
    await tick();
    expect(value.adapter.notifyPeers).not.toHaveBeenCalled();
    expect(value.adapter.syncFromHistory).toHaveBeenCalledTimes(1);
    connector.dispose();
  });

  it('rebinds navigation without carrying an old Host notification into the new connection', async () => {
    const value = fixture();
    const next = fixture();
    const connector = createBridgeRouterConnector({
      navigation: value.navigation,
      onError: jest.fn(),
    });
    connector.attach(value.adapter);
    await tick();
    value.setSnapshot({
      ...value.snapshot(),
      pendingLocation: { url: '/inventory/slow', key: 'slow' },
    });
    value.hostMove('/outside');
    connector.setNavigation(next.navigation);
    expect(value.hostListeners.size).toBe(0);
    expect(next.hostListeners.size).toBe(1);
    value.hostMove('/outside');
    await tick();
    expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
    connector.dispose();
    expect(next.hostListeners.size).toBe(0);
  });

  it('isolates mounts and drops queued work after disposal', async () => {
    const first = fixture({ action: 'PUSH' });
    const second = fixture({ action: 'PUSH' });
    const a = createBridgeRouterConnector({
      navigation: first.navigation,
      onError: jest.fn(),
    });
    const b = createBridgeRouterConnector({
      navigation: second.navigation,
      onError: jest.fn(),
    });
    a.attach(first.adapter);
    b.attach(second.adapter);
    a.dispose();
    a.dispose();
    await tick();
    expect(first.adapter.getSnapshot).not.toHaveBeenCalled();
    expect(first.routerListeners.size).toBe(0);
    expect(first.hostListeners.size).toBe(0);
    expect(second.adapter.notifyPeers).toHaveBeenCalledTimes(1);
    b.dispose();
  });

  it('replaces the Router subscription and uses only the latest snapshot', async () => {
    const first = fixture({ action: 'PUSH' });
    const second = fixture({ action: 'REPLACE' });
    const connector = createBridgeRouterConnector({ onError: jest.fn() });
    connector.attach(first.adapter);
    connector.attach(second.adapter);
    await tick();
    expect(first.routerListeners.size).toBe(0);
    expect(first.adapter.notifyPeers).not.toHaveBeenCalled();
    expect(second.adapter.notifyPeers).toHaveBeenCalledTimes(1);
    connector.dispose();
  });

  it('reports adapter failures from the queued lifecycle instead of render', async () => {
    const value = fixture();
    const error = new Error('Router mode mismatch');
    value.navigation.getLocation.mockImplementation(() => {
      throw error;
    });
    const onError = jest.fn();
    const connector = createBridgeRouterConnector({
      navigation: value.navigation,
      onError,
    });
    connector.attach(value.adapter);
    expect(onError).not.toHaveBeenCalled();
    await tick();
    expect(onError).toHaveBeenCalledWith(error);
    expect(value.adapter.syncFromHistory).not.toHaveBeenCalled();
    expect(value.adapter.notifyPeers).not.toHaveBeenCalled();
    connector.dispose();
  });
});
