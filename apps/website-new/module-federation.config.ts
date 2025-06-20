import { createModuleFederationConfig } from '@module-federation/rspress-plugin';

const LANGUAGE = 'LANGUAGE';
const LANGUAGES = ['zh', 'en'];

const exposes = {
  // basic
  [`./rspack-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/rspack.mdx`,
  [`./webpack-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/webpack.mdx`,
  [`./cli-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/cli.mdx`,
  [`./type-prompt-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/basic/type-prompt.mdx`,

  // debug
  [`./mode-${LANGUAGE}`]: `./docs/${LANGUAGE}/guide/debug/mode.mdx`,
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
});
