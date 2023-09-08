import type { LoaderContext } from 'webpack';

import { Template } from 'webpack';
import path from 'path';

/**
 * This loader was specially created for tunning next-image-loader result
 *   see https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/loaders/next-image-loader.js
 * It takes regular string
 *   `export default {"src":"/_next/static/media/ssl.e3019f0e.svg","height":20,"width":20};`
 * And injects the following code:
 * for ssr:
 * remote scope of specific remote url
 * for csr:
 * document.currentScript.src
 * after that, it will choose the full uri before _next
 *
 * for example:
 * http://localhost:1234/test/test2/_next/static/media/ssl.e3019f0e.svg
 * will become
 * http://localhost:1234/test/test2
 *
 */
export async function fixImageLoader(
  this: LoaderContext<Record<string, unknown>>,
  remaining: string
) {
  this.cacheable(true);

  const isServer = this._compiler?.options.name !== 'client';
  //@ts-ignore
  const {publicPath} = this._compiler?.webpack.RuntimeGlobals;

  const result = await this.importModule(
    `${this.resourcePath}.webpack[javascript/auto]!=!${remaining}`
  );

  const content = (result.default || result) as Record<string, string>;

  const computedAssetPrefix = isServer
    ? `${Template.asString([
        'function getSSRImagePath(){',
        Template.asString([
          'try {',
          Template.indent([
            'const remoteEntry = globalThis.__remote_scope__ && globalThis.__remote_scope__._config[__webpack_runtime_id__];',
            `if (remoteEntry) {`,
            Template.indent([
              `const splitted = remoteEntry.split('/_next')`,
              `return splitted.length === 2 ? splitted[0] : '';`,
            ]),
            `}`,
            `return '';`,
          ]),
          '} catch (e) {',
          Template.indent([
            `console.error('failed generating SSR image path', e);`,
            'return "";',
          ]),
          '}',
        ]),
        '}()',
      ])}`
    : `${Template.asString([
        'function getCSRImagePath(){',
        Template.indent([
          'try {',
          Template.indent([
            `if(typeof document === 'undefined')`,
            Template.indent(
              `return ${publicPath} && ${publicPath}.indexOf('://') > 0 ? new URL(${publicPath}).origin : ''`
            ),
            `const path = (document.currentScript && document.currentScript.src) || new URL(${publicPath}).origin;`,
            `const splitted = path.split('/_next')`,
            `return splitted.length === 2 ? splitted[0] : '';`,
          ]),
          '} catch (e) {',
          Template.indent([
            `const path = document.currentScript && document.currentScript.src;`,
            `console.error('failed generating CSR image path', e, path);`,
            'return "";',
          ]),
          '}',
        ]),
        '}()',
      ])}`;

  const constructedObject = Object.entries(content).reduce(
    (acc, [key, value]) => {
      if (key === 'src') {
        if (value && !value.includes('://')) {
          value = path.join(value);
        }
        acc.push(
          `${key}: computedAssetsPrefixReference + ${JSON.stringify(value)}`
        );
        return acc;
      }
      acc.push(`${key}: ${JSON.stringify(value)}`);
      return acc;
    },
    [] as string[]
  );

  return Template.asString([
    "let computedAssetsPrefixReference = '';",
    'try {',
    Template.indent(`computedAssetsPrefixReference = ${computedAssetPrefix};`),
    '} catch (e) {}',
    'export default {',
    Template.indent(constructedObject.join(',\n')),
    '}',
  ]);
}

export const pitch = fixImageLoader;
