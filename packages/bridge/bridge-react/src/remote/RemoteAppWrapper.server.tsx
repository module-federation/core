import React, { forwardRef, useContext } from 'react';
import { BridgeSSRContext } from '../ssr';
import { getRootDomDefaultClassName } from '../utils';
import type { RemoteAppWrapperProps } from './RemoteAppWrapper';
export const RemoteAppWrapper = forwardRef<
  HTMLDivElement,
  RemoteAppWrapperProps
>((props, ref) => {
  const ssr = useContext(BridgeSSRContext);
  const id = props.ssrInstanceId;
  if (ssr && id && props.ssrProvider)
    ssr.reserve(id).activate(() => props.ssrProvider!, {
      moduleName: props.moduleName,
      basename: props.routing?.basename,
      memoryRoute: props.routing?.memoryRoute,
      props: props.remoteProps,
    });
  return (
    <div
      ref={ref}
      data-mf-bridge={props.moduleName}
      id={id}
      data-mf-bridge-root={id}
      data-mf-bridge-ssr={props.ssrProvider ? '' : undefined}
      className={`${getRootDomDefaultClassName(props.moduleName)} ${props.className || ''}`}
      style={props.style}
    >
      {props.loading}
    </div>
  );
});
