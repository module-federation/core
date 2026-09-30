import type React from 'react';
import type {
  BridgeProvider,
  RemoteAppParams,
  RemoteComponentProps,
} from '../types';

export type RemoteLifecycleProps = RemoteAppParams & RemoteComponentProps;

export interface RemoteLifecycleResult {
  serverHTML: { __html: string } | null;
  stylesheetHrefs: string[];
}

/** Both build targets preserve the same host component and container structure. */
export type UseRemoteLifecycle = (
  props: RemoteLifecycleProps,
  instanceId: string | undefined,
  rootRef: React.MutableRefObject<HTMLDivElement | null>,
) => RemoteLifecycleResult;

export type UseRemoteSSRRegistration = (
  instanceId: string | undefined,
  factory: () => BridgeProvider | Promise<BridgeProvider>,
  props: Record<string, unknown>,
  options?: { deferRender?: boolean },
) => void;
