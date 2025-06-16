import { kit, ERROR_TYPE, autoFetchDataPlugin } from './module';
export type {
  DataFetchParams,
  NoSSRRemoteInfo,
  CollectSSRAssetsOptions,
  CreateRemoteComponentOptions,
} from './module';

const {
  createRemoteSSRComponent,
  createRemoteComponent,
  collectSSRAssets,
  wrapNoSSR,
  injectDataFetch,
  callDataFetch,
} = kit;

export {
  createRemoteSSRComponent,
  createRemoteComponent,
  collectSSRAssets,
  wrapNoSSR,
  injectDataFetch,
  callDataFetch,
  ERROR_TYPE,
  autoFetchDataPlugin,
};
