import {
  callDataFetch,
  setSSREnv,
} from '@module-federation/bridge-react/data-fetch';

import type { RuntimePluginFuture } from '@modern-js/runtime';

export const injectDataFetchFunctionPlugin = ({
  fetchServerQuery,
}: {
  fetchServerQuery?: Record<string, unknown>;
}): RuntimePluginFuture => ({
  name: '@module-federation/inject-data-fetch-function-plugin',

  setup: (api) => {
    api.onBeforeRender(async () => {
      setSSREnv({ fetchServerQuery });

      await callDataFetch();
    });
  },
});
