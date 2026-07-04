import { createModuleFederationConfig } from '@module-federation/rspress-plugin';
import * as path from 'path';

const LANGUAGE = 'LANGUAGE';
const LANGUAGES = ['zh', 'en'];
const PLAYGROUND_REMOTE_NAME = 'mf_playground';
const PLAYGROUND_REMOTE_MANIFEST_URL =
  process.env.PLAYGROUND_REMOTE_MANIFEST_URL ||
  process.env.PLAYGROUND_MANIFEST_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:3006/mf-manifest.json'
    : 'https://unpkg.com/@module-federation/playground@latest/dist/mf/mf-manifest.json');

const exposes = {
  // basic
  [`./plugins-overview-${LANGUAGE}`]: `./docs/${LANGUAGE}/integrations/index.mdx`,
  [`./rspack-${LANGUAGE}`]: `./docs/${LANGUAGE}/integrations/bundler/rspack.mdx`,
  [`./webpack-${LANGUAGE}`]: `./docs/${LANGUAGE}/integrations/bundler/webpack.mdx`,
  [`./rspress-${LANGUAGE}`]: `./docs/${LANGUAGE}/integrations/documentation/rspress.mdx`,
  [`./cli-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/cli.mdx`,
  [`./type-prompt-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/type-prompt.mdx`,
  [`./css-isolate-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/css-isolate.mdx`,

  [`./data-fetch-index-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/data/data-fetch.mdx`,
  [`./data-fetch-cache-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/data/data-fetch-cache.mdx`,
  [`./data-fetch-prefetch-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/data/data-prefetch.mdx`,

  // debug
  [`./mode-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/debug/mode.mdx`,
  [`./variables-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/debug/variables.mdx`,

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
  [`./configure-tree-shaking-dir-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/treeShakingDir.mdx`,
  [`./configure-tree-shaking-shared-exclude-plugins-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/treeShakingSharedExcludePlugins.mdx`,
  [`./configure-tree-shaking-shared-plugins-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/treeShakingSharedPlugins.mdx`,
  [`./configure-inject-tree-shaking-used-exports-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/injectTreeShakingUsedExports.mdx`,
  [`./configure-experiments-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/experiments.mdx`,

  // [`./configure-shareStrategy-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/shareStrategy.mdx`,
  // [`./configure-experiments-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/experiments.mdx`,

  // bridge
  [`./bridge-overview-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/bridge/overview.mdx`,
  [`./bridge-getting-started-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/bridge/react/getting-started.mdx`,
  [`./bridge-export-app-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/bridge/react/export-app.mdx`,
  [`./bridge-load-app-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/bridge/react/load-app.mdx`,
  [`./bridge-load-component-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/bridge/react/load-component.mdx`,
  [`./bridge-vue-${LANGUAGE}`]: `./docs/${LANGUAGE}/integrations/practice/vue.mdx`,

  // plugin
  [`./plugin-introduce-${LANGUAGE}`]: `./docs/${LANGUAGE}/plugin/dev/index.mdx`,
  [`./plugin-retry-${LANGUAGE}`]: `./docs/${LANGUAGE}/plugin/plugins/retry-plugin.mdx`,
  [`./plugin-observability-${LANGUAGE}`]: `./docs/${LANGUAGE}/plugin/plugins/observability-plugin.mdx`,

  // blog
  [`./error-load-remote-${LANGUAGE}`]: `./docs/${LANGUAGE}/blog/error-load-remote.mdx`,

  [`./node-${LANGUAGE}`]: `./docs/${LANGUAGE}/blog/node.mdx`,
  // ai-skills
  // [`./ai-skills-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/ai-skills/index.mdx`,

  // advanced
  [`./advanced-multiple-shared-scope-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/advanced/multiple-shared-scope.mdx`,
};

export default createModuleFederationConfig({
  filename: 'remoteEntry.js',
  name: 'mf_doc',
  shareStrategy: 'loaded-first',
  remotes: {
    [PLAYGROUND_REMOTE_NAME]: `${PLAYGROUND_REMOTE_NAME}@${PLAYGROUND_REMOTE_MANIFEST_URL}`,
  },
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
