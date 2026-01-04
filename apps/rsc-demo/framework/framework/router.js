/**
 * Shared router implementation for the RSC notes apps.
 *
 * This is imported directly by both app1 and app2 so that navigation,
 * callServer, and SSR integration stay in sync.
 */

'use client';

import {
  createContext,
  startTransition,
  useContext,
  useState,
  use,
} from 'react';
import {
  createFromFetch,
  createFromReadableStream,
  encodeReply,
} from 'react-server-dom-webpack/client';

// RSC Action header (must match server)
const RSC_ACTION_HEADER = 'rsc-action';

export async function callServer(actionId, args) {
  const body = await encodeReply(args);

  const response = await fetch('/react', {
    method: 'POST',
    headers: {
      Accept: 'text/x-component',
      [RSC_ACTION_HEADER]: actionId,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Server action failed: ${await response.text()}`);
  }

  const resultHeader = response.headers.get('X-Action-Result');
  const actionResult = resultHeader ? JSON.parse(resultHeader) : undefined;

  return actionResult;
}

const RouterContext = createContext();
const initialCache = new Map();

export function initFromSSR(rscData) {
  const initialLocation = {
    selectedId: null,
    isEditing: false,
    searchText: '',
  };
  const locationKey = JSON.stringify(initialLocation);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(rscData));
      controller.close();
    },
  });

  const content = createFromReadableStream(stream);
  initialCache.set(locationKey, content);
}

export function Router() {
  const [cache, setCache] = useState(initialCache);
  const [location, setLocation] = useState({
    selectedId: null,
    isEditing: false,
    searchText: '',
  });

  const locationKey = JSON.stringify(location);
  let content = cache.get(locationKey);
  if (!content) {
    content = createFromFetch(
      fetch('/react?location=' + encodeURIComponent(locationKey)),
    );
    cache.set(locationKey, content);
  }

  function refresh(response) {
    startTransition(() => {
      const nextCache = new Map();
      if (response != null) {
        const locationKey = response.headers.get('X-Location');
        const nextLocation = JSON.parse(locationKey);
        const nextContent = createFromReadableStream(response.body);
        nextCache.set(locationKey, nextContent);
        navigate(nextLocation);
      }
      setCache(nextCache);
    });
  }

  function navigate(nextLocation) {
    startTransition(() => {
      setLocation((loc) => ({
        ...loc,
        ...nextLocation,
      }));
    });
  }

  return (
    <RouterContext.Provider value={{ location, navigate, refresh }}>
      {use(content)}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    return {
      location: { selectedId: null, isEditing: false, searchText: '' },
      navigate: () => {},
      refresh: () => {},
    };
  }
  return context;
}

export function useMutation({ endpoint, method }) {
  const { refresh } = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [didError, setDidError] = useState(false);
  const [error, setError] = useState(null);
  if (didError) {
    throw error;
  }

  async function performMutation(payload, requestedLocation) {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${endpoint}?location=${encodeURIComponent(
          JSON.stringify(requestedLocation),
        )}`,
        {
          method,
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      refresh(response);
    } catch (e) {
      setDidError(true);
      setError(e);
    } finally {
      setIsSaving(false);
    }
  }

  return [isSaving, performMutation];
}
