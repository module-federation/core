import { RemoteAppWrapper } from './remote/RemoteAppWrapper';
import { useBrowserEnvironment } from './remote/environment.browser';
import {
  createReactRemoteFactory,
  createReactRemoteComponentFactory,
} from './reactRemote.shared';
export type * from './reactRemoteTypes';

export const createReactRemote = /* @__PURE__ */ createReactRemoteFactory(
  RemoteAppWrapper,
  useBrowserEnvironment,
);
export const ReactRemote = /* @__PURE__ */ createReactRemoteComponentFactory(
  RemoteAppWrapper,
  useBrowserEnvironment,
);
