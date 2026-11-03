import React, { useEffect, useRef } from 'react';
import {
  dispatchPopstateEnv,
  type BridgeOperationContext,
} from '@module-federation/bridge-shared';
import { federationRuntime } from '../../provider/plugin';
import {
  RemoteAppWrapper,
  type RemoteAppWrapperProps,
} from '../RemoteAppWrapper';
import { createRouterMount } from './router-mount';
function useRouteSync({
  current,
  basename,
  automatic,
  props,
}: {
  current?: string;
  basename: string;
  automatic: boolean;
  props: RemoteAppWrapperProps;
}) {
  const previous = useRef(current);
  const instance = props.instance || federationRuntime.instance;
  useEffect(() => {
    const from = previous.current;
    previous.current = current;
    if (
      !automatic ||
      from === undefined ||
      current === undefined ||
      from === current
    )
      return;
    const context: BridgeOperationContext = {
      side: 'consumer',
      framework: 'react',
      operation: 'route-sync',
      moduleName: props.moduleName,
      route: {
        action: 'host-to-remote',
        mechanism: 'popstate',
        from,
        to: current,
        basename,
      },
    };
    dispatchPopstateEnv();
    instance?.bridgeHook?.lifecycle.afterBridgeRouteSync.emit({ context });
  }, [current, basename, instance, props.moduleName, automatic]);
}
export function withRouterData(
  WrappedComponent: React.ComponentType<
    RemoteAppWrapperProps & React.RefAttributes<HTMLDivElement>
  >,
) {
  return createRouterMount(WrappedComponent, useRouteSync);
}
export default withRouterData(RemoteAppWrapper);
