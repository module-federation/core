import { RemoteAppWrapper } from './remote/RemoteAppWrapper.server';
import { useServerEnvironment } from './remote/environment.server';
import {
  createReactRemoteFactory,
  createReactRemoteComponentFactory,
} from './reactRemote.shared';
export type * from './reactRemoteTypes';

export const createReactRemote = /* @__PURE__ */ createReactRemoteFactory(
  RemoteAppWrapper,
  useServerEnvironment,
);
export const ReactRemote = /* @__PURE__ */ createReactRemoteComponentFactory(
  RemoteAppWrapper,
  useServerEnvironment,
);
