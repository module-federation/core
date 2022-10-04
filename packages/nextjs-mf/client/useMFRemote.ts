import * as React from 'react';
import type { MFClient } from './MFClient';
import { RemoteContainer } from './RemoteContainer';

type UseMFRemoteResult = {
  /** is container loaded or not */
  loaded: boolean;
  /** remote is Lazy, so it will be loaded if getModule(), getContainer() were called */
  remote: RemoteContainer;
  /** Present if error occurs during remote container loading */
  error: Error | undefined;
};

const isBrowser = typeof window !== 'undefined';

/**
 * React hook which provides an access to RemoteContainer in Module Federation
 *
 * @param global - can be a global variable name OR connection string "global@url"
 */
export function useMFRemote(global: string): UseMFRemoteResult {
  let remote: RemoteContainer;

  if (isBrowser) {
    // on client (we get instances from global variable because webpack breaks Singletons)
    const MFClient: MFClient = window && (window as any).mf_client;
    remote = MFClient.remotes[global] || MFClient.registerRemote(global);
  } else {
    // on server side
    remote = RemoteContainer.createSingleton(global);
  }

  const [loaded, setLoaded] = React.useState(remote.isLoaded());
  const [error, setError] = React.useState(remote.error);

  React.useEffect(() => {
    const handleLoadComplete = () => {
      setLoaded(true);
    };
    const handleLoadError = (e: Error) => {
      setError(e);
    };

    if (!loaded && remote.isLoaded()) {
      handleLoadComplete();
    }

    remote.events.on('loadComplete', handleLoadComplete);
    remote.events.on('loadError', handleLoadError);
    return () => {
      remote.events.off('loadComplete', handleLoadComplete);
      remote.events.off('loadError', handleLoadError);
    };
  }, [remote]);

  return {
    remote,
    loaded,
    error,
  };
}
