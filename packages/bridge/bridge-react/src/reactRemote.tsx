import { RemoteAppWrapper } from './remote/RemoteAppWrapper';
import { useBrowserEnvironment } from './remote/environment.browser';
import { createReactRemoteConsumers as createConsumers } from './reactRemote.shared';
import type { RemoteAppWrapperProps } from './remote/RemoteAppWrapper';
import type React from 'react';
export type * from './reactRemoteTypes';
export function createReactRemoteConsumers(
  RemoteApp: React.ComponentType<RemoteAppWrapperProps>,
) {
  return createConsumers(RemoteApp, useBrowserEnvironment);
}
export const { createReactRemote, ReactRemote } =
  createReactRemoteConsumers(RemoteAppWrapper);
