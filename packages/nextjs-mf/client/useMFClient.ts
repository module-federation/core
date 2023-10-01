import * as React from 'react';
import singletonRouter from 'next/dist/client/router';

import type { MFClient } from './MFClient';
import type { RemoteContainer } from './RemoteContainer';

export type MFClientHookOptions = {
  /**
   * This callback will be called when user switches to federated page
   *   - as a first arg you will receive RemoteContainer
   * If user return back to the host application page
   *   - then the first argument became `undefined`
   *
   * This callback is called only if changed remote from which served current visible page
   * and does not called on internal nextjs route changes.
   *
   * This callback helps in very convenient way in _app.tsx (or any other React component)
   * load additional data from RemoteContainer and pass it to your application. Eg.:
   *   - application menu
   *   - apollo configs
   *   - translation strings
   */
  onChangeRemote?: (
    remote: RemoteContainer | undefined,
    MFClient: MFClient,
  ) => void;
};

type InnerState = {
  remote: RemoteContainer | undefined;
};

const isBrowser = typeof window !== 'undefined';

/**
 * React hook which provides convenient way for working with ModuleFederation runtime changes in runtime;
 */
export function useMFClient(opts: MFClientHookOptions): MFClient {
  const MFClient: MFClient = isBrowser
    ? (window as any).mf_client
    : /* TODO: inject here SSR version of MFClient if it will be needed in future */ ({} as any);

  const innerState = React.useRef<InnerState>({
    remote: undefined,
  });

  React.useEffect(() => {
    // Step 1: Define handlers and helpers
    const processRemoteChange = (remote: RemoteContainer | undefined) => {
      if (innerState.current.remote !== remote) {
        innerState.current.remote = remote;
        if (opts?.onChangeRemote) {
          opts.onChangeRemote(remote, MFClient);
        }
      }
    };

    const handleRouterChange = (pathname: string) => {
      if (MFClient.isFederatedPathname(pathname)) {
        const remote = MFClient.remotePages.routeToRemote(pathname);
        processRemoteChange(remote);
      } else {
        processRemoteChange(undefined);
      }
    };

    // Step 2: run bootstrap logic
    const initialRemote = MFClient.isFederatedPathname(window.location.pathname)
      ? MFClient.remotePages.routeToRemote(window.location.pathname)
      : undefined;

    if (initialRemote) {
      // important for first load to fire `onChangeRemote` with different remote
      // because in innerState by default we assume that used local application
      processRemoteChange(initialRemote);
    }

    // Step 3: Subscribe on events
    singletonRouter.events.on('routeChangeStart', handleRouterChange);
    return () => {
      singletonRouter.events.off('routeChangeStart', handleRouterChange);
    };
  }, []);

  return MFClient;
}
