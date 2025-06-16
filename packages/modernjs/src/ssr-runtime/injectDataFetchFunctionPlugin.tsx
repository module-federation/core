import { kit } from '@module-federation/react/pure';

const { callDataFetch, injectDataFetch, setSSREnv } = kit;
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
      injectDataFetch();

      await callDataFetch();
    });
  },
});
