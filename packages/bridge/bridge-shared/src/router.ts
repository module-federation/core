/** A Router URL and the stable identity of its history entry. */
export interface BridgeRouterLocation {
  url: string;
  key: string;
}

export interface BridgeRouterSnapshot {
  location: BridgeRouterLocation;
  /** The navigation currently loading, excluding background revalidation. */
  pendingLocation?: BridgeRouterLocation;
  action: 'POP' | 'PUSH' | 'REPLACE';
  initialized: boolean;
}

/** Framework adapters own Router APIs and Browser/Hash URL interpretation. */
export interface BridgeRouterAdapter {
  getSnapshot: () => BridgeRouterSnapshot;
  subscribe: (listener: () => void) => () => void;
  /** Current Browser/Hash logical URL, including the mount basename. */
  getHistoryLocation: () => BridgeRouterLocation;
  /** Begin consuming the current history entry without writing another entry. */
  syncFromHistory: () => void;
  /**
   * Notify other Routers after this Router has written history. Exclude the
   * writing Router, including when it has started a subsequent navigation.
   */
  notifyPeers: () => void;
}

export interface BridgeRouterConnectorOptions {
  /** Accepts the existing BridgeNavigation without introducing another bus. */
  navigation?: {
    getLocation: () => string;
    subscribe: (listener: () => void) => () => void;
  };
  onError: (error: unknown) => void;
}

export interface BridgeRouterConnector {
  attach: (adapter: BridgeRouterAdapter) => void;
  setNavigation: (
    navigation: BridgeRouterConnectorOptions['navigation'],
  ) => void;
  dispose: () => void;
}

const sameLocation = (
  left: BridgeRouterLocation | undefined,
  right: BridgeRouterLocation,
) => left?.url === right.url && left.key === right.key;

/**
 * Coordinate one mounted Router with browser history. Creation belongs to the
 * mount lifecycle. Attaching only subscribes and queues work, so Router creation
 * during render cannot synchronously notify another React Root.
 */
export function createBridgeRouterConnector({
  navigation: initialNavigation,
  onError,
}: BridgeRouterConnectorOptions): BridgeRouterConnector {
  let active = true;
  let queued = false;
  let adapter: BridgeRouterAdapter | undefined;
  let navigation: BridgeRouterConnectorOptions['navigation'];
  let stopRouter: (() => void) | undefined;
  let stopHost: (() => void) | undefined;
  let observedLocation: BridgeRouterLocation | undefined;

  const flush = () => {
    queued = false;
    if (!active || !adapter) return;
    try {
      const snapshot = adapter.getSnapshot();
      const history = adapter.getHistoryLocation();
      const hostLocation = navigation?.getLocation();
      const committed = sameLocation(snapshot.location, history);
      const pending = sameLocation(snapshot.pendingLocation, history);

      if (
        (hostLocation === undefined || hostLocation === history.url) &&
        !pending &&
        !committed
      ) {
        // A native POP can reach both Routers before the Host publishes its
        // location. Do not restart a Remote already loading that same entry.
        // A new entry key, even at the same URL, must cancel the old navigation.
        adapter.syncFromHistory();
        return;
      }

      if (snapshot.initialized) {
        const changed = !sameLocation(observedLocation, snapshot.location);
        observedLocation = { ...snapshot.location };
        if (changed && committed && snapshot.action !== 'POP') {
          // Also covers a redirect that completed before attach. This does not
          // depend on a Host adapter: browser-only consumers need notification too.
          adapter.notifyPeers();
        }
      }
    } catch (error) {
      onError(error);
    }
  };
  const schedule = () => {
    if (!active || queued) return;
    queued = true;
    queueMicrotask(flush);
  };
  const setNavigation: BridgeRouterConnector['setNavigation'] = (next) => {
    if (!active || navigation === next) return;
    stopHost?.();
    navigation = next;
    stopHost = next?.subscribe(schedule);
    schedule();
  };
  setNavigation(initialNavigation);

  return {
    attach(next) {
      if (!active) return;
      if (adapter !== next) {
        stopRouter?.();
        adapter = next;
        observedLocation = undefined;
        stopRouter = next.subscribe(schedule);
      }
      schedule();
    },
    setNavigation,
    dispose() {
      if (!active) return;
      active = false;
      stopRouter?.();
      stopHost?.();
      adapter = undefined;
      navigation = undefined;
    },
  };
}
