import type { RuntimePlugin } from '@modern-js/runtime';

// Module Federation is not applied to web-worker builds (see `skipByTarget`),
// so the SSR runtime plugins have no federation runtime to attach to there.
// The package exports resolve both plugin entries to this module under the
// `worker` condition, which Rspack sets for `webworker` targets. This keeps
// the Node-only data-fetch and live-reload code out of worker bundles.

export const injectDataFetchFunctionPlugin = (_options: {
  fetchServerQuery?: Record<string, unknown>;
}): RuntimePlugin => ({
  name: '@module-federation/inject-data-fetch-function-plugin',
});

export const mfSSRDevPlugin = (): RuntimePlugin => ({
  name: '@module-federation/modern-js',
});
