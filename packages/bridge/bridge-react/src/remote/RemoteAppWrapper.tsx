/** Shared shell for isolated remote roots on both build targets. */
import React, { useImperativeHandle, useRef, forwardRef } from 'react';
import { useRemoteLifecycle } from '@module-federation/bridge-react/remote-lifecycle';
import { getRootDomDefaultClassName } from '../utils';
import { HydratedStylesheetAssets } from '../lazy/HydratedStylesheetAssets';
import type { RemoteComponentProps, RemoteAppParams } from '../types';

export const RemoteAppWrapper = forwardRef<
  HTMLDivElement,
  RemoteAppParams & RemoteComponentProps
>(function (props, ref) {
  const { moduleName, ssrInstanceId, className, style, loading } = props;
  // React's version is fixed for this consumer. Legacy consumers keep the CSR path.
  const reactId = React.useId?.();
  const instanceId =
    ssrInstanceId || (reactId ? `mf-bridge-${reactId}` : undefined);
  const rootRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);
  const { serverHTML, stylesheetHrefs } = useRemoteLifecycle(
    props,
    instanceId,
    rootRef,
  );
  const rootComponentClassName = `${getRootDomDefaultClassName(moduleName)} ${className || ''}`;
  const containerProps = {
    id: instanceId,
    'data-mf-bridge-root': instanceId,
    className: rootComponentClassName,
    style,
    ref: rootRef,
  };
  return (
    <>
      <HydratedStylesheetAssets hrefs={stylesheetHrefs} />
      {serverHTML ? (
        <div
          {...containerProps}
          suppressHydrationWarning
          dangerouslySetInnerHTML={serverHTML}
        />
      ) : (
        <div {...containerProps}>{loading}</div>
      )}
    </>
  );
});
