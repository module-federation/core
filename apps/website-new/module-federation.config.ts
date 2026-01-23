import { createModuleFederationConfig } from '@module-federation/rspress-plugin';
import * as path from 'path';

const LANGUAGE = 'LANGUAGE';
const LANGUAGES = ['zh', 'en'];

const exposes = {
  // basic
  [`./plugins-overview-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/plugins/overview.mdx`,
  [`./rspack-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/plugins/rspack.mdx`,
  [`./webpack-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/plugins/webpack.mdx`,
  [`./rspress-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/plugins/rspress.mdx`,
  [`./cli-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/cli.mdx`,
  [`./type-prompt-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/type-prompt.mdx`,
  [`./css-isolate-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/css-isolate.mdx`,

  [`./data-fetch-index-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/data-fetch/index.mdx`,
  [`./data-fetch-cache-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/data-fetch/cache.mdx`,
  [`./data-fetch-prefetch-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/data-fetch/prefetch.mdx`,
  // runtime
  // [`./runtime-overview-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/runtime/runtime.mdx`,
  // [`./runtime-api-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/runtime/runtime-api.mdx`,
  // [`./runtime-hooks-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/runtime/runtime-hooks.mdx`,

  // debug
  [`./mode-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/debug/mode.mdx`,
  [`./variables-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/debug/variables.mdx`,

  // framework
  // [`./modernjs-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/framework/modernjs.mdx`,

  // configure
  [`./configure-overview-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/index.mdx`,
  [`./configure-name-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/name.mdx`,
  [`./configure-filename-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/filename.mdx`,
  [`./configure-remotes-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/remotes.mdx`,
  [`./configure-exposes-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/exposes.mdx`,
  [`./configure-shared-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/shared.mdx`,
  // [`./configure-runtimePlugins-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/runtimePlugins.mdx`,
  [`./configure-getpublicpath-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/getpublicpath.mdx`,
  [`./configure-implementation-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/implementation.mdx`,
  [`./configure-dts-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/dts.mdx`,
  [`./configure-dev-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/dev.mdx`,
  [`./configure-manifest-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/manifest.mdx`,
  // [`./configure-shareStrategy-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/shareStrategy.mdx`,
  // [`./configure-experiments-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/experiments.mdx`,

  // bridge
  [`./bridge-overview-${LANGUAGE}`]: `./docs/${LANGUAGE}/practice/bridge/overview.mdx`,
  [`./bridge-getting-started-${LANGUAGE}`]: `./docs/${LANGUAGE}/practice/bridge/react-bridge/getting-started.mdx`,
  [`./bridge-export-app-${LANGUAGE}`]: `./docs/${LANGUAGE}/practice/bridge/react-bridge/export-app.mdx`,
  [`./bridge-load-app-${LANGUAGE}`]: `./docs/${LANGUAGE}/practice/bridge/react-bridge/load-app.mdx`,
  [`./bridge-load-component-${LANGUAGE}`]: `./docs/${LANGUAGE}/practice/bridge/react-bridge/load-component.mdx`,
  [`./bridge-vue-${LANGUAGE}`]: `./docs/${LANGUAGE}/practice/bridge/vue-bridge.mdx`,

  // plugin
  [`./plugin-introduce-${LANGUAGE}`]: `./docs/${LANGUAGE}/plugin/dev/index.mdx`,
  [`./plugin-retry-${LANGUAGE}`]: `./docs/${LANGUAGE}/plugin/plugins/retry-plugin.mdx`,

  // blog
  [`./error-load-remote-${LANGUAGE}`]: `./docs/${LANGUAGE}/blog/error-load-remote.mdx`,
  [`./node-${LANGUAGE}`]: `./docs/${LANGUAGE}/blog/node.mdx`,
};

export default createModuleFederationConfig({
  filename: 'remoteEntry.js',
  name: 'mf_doc',
  exposes: Object.entries(exposes).reduce((acc, [key, value]) => {
    LANGUAGES.forEach((lang) => {
      acc[key.replace(LANGUAGE, lang)] = path.join(
        __dirname,
        value.replace(LANGUAGE, lang),
      );
    });
    return acc;
  }, {}),
});
