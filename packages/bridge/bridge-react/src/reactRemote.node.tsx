import { createReactRemoteConsumers as createConsumers } from './reactRemote.shared';
import { useServerEnvironment } from './remote/environment.server';
import { RemoteAppWrapper } from './remote/RemoteAppWrapper.server';
import type { RemoteAppWrapperProps } from './remote/RemoteAppWrapper';
import type React from 'react';
export type * from './reactRemoteTypes';
export function createReactRemoteConsumers(
  RemoteApp: React.ComponentType<RemoteAppWrapperProps>,
) {
  return createConsumers(RemoteApp, useServerEnvironment);
}
export const { createReactRemote, ReactRemote } =
  createReactRemoteConsumers(RemoteAppWrapper);
