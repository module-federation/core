import { createModuleFederationConfig } from '@module-federation/rspress-plugin';

const LANGUAGE = 'LANGUAGE';
const LANGUAGES = ['zh', 'en'];

const exposes = {
  // basic
  [`./rspack-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/rspack.mdx`,
  [`./webpack-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/webpack.mdx`,
  [`./rspress-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/rspress.mdx`,
  [`./cli-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/cli.mdx`,
  [`./type-prompt-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/type-prompt.mdx`,
  [`./css-isolate-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/css-isolate.mdx`,
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
  [`./configure-runtimePlugins-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/runtimePlugins.mdx`,
  [`./configure-getpublicpath-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/getpublicpath.mdx`,
  [`./configure-implementation-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/implementation.mdx`,
  [`./configure-dts-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/dts.mdx`,
  [`./configure-dev-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/dev.mdx`,
  [`./configure-manifest-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/manifest.mdx`,
  [`./configure-shareStrategy-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/shareStrategy.mdx`,
  [`./configure-experiments-${LANGUAGE}`]: `./docs/${LANGUAGE}/configure/experiments.mdx`,

  // blog
  [`./error-load-remote-${LANGUAGE}`]: `./docs/${LANGUAGE}/blog/error-load-remote.mdx`,
};

export default createModuleFederationConfig({
  filename: 'remoteEntry.js',
  name: 'mf_doc',
  exposes: Object.entries(exposes).reduce((acc, [key, value]) => {
    LANGUAGES.forEach((lang) => {
      acc[key.replace(LANGUAGE, lang)] = value.replace(LANGUAGE, lang);
    });
    return acc;
  }, {}),
  shared: {
    '@rspress/runtime': {
      singleton: true,
      requiredVersion: false,
    },
  },
});
