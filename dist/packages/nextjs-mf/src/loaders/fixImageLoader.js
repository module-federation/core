"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pitch = exports.fixImageLoader = void 0;
const tslib_1 = require("tslib");
const webpack_1 = require("webpack");
const path_1 = tslib_1.__importDefault(require("path"));
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
async function fixImageLoader(remaining) {
    this.cacheable(true);
    const isServer = this._compiler?.options.name !== 'client';
    const publicPath = this._compiler?.webpack.RuntimeGlobals.publicPath;
    const result = await this.importModule(`${this.resourcePath}.webpack[javascript/auto]!=!${remaining}`);
    const content = (result.default || result);
    const computedAssetPrefix = isServer
        ? `${webpack_1.Template.asString([
            'function getSSRImagePath(){',
            webpack_1.Template.asString([
                'try {',
                webpack_1.Template.indent([
                    'const remoteEntry = global.__remote_scope__ && global.remoteEntryName && global.__remote_scope__._config[global.remoteEntryName];',
                    `if (remoteEntry) {`,
                    webpack_1.Template.indent([
                        `const splitted = remoteEntry.split('/_next')`,
                        `return splitted.length === 2 ? splitted[0] : '';`,
                    ]),
                    `}`,
                    `return '';`,
                ]),
                '} catch (e) {',
                webpack_1.Template.indent([
                    `console.error('failed generating SSR image path', e);`,
                    'return "";',
                ]),
                '}',
            ]),
            '}()',
        ])}`
        : `${webpack_1.Template.asString([
            'function getCSRImagePath(){',
            webpack_1.Template.indent([
                'try {',
                webpack_1.Template.indent([
                    `if(typeof document === 'undefined')`,
                    webpack_1.Template.indent(`return ${publicPath} && ${publicPath}.indexOf('://') > 0 ? new URL(${publicPath}).origin : ''`),
                    `const path = document.currentScript && document.currentScript.src;`,
                    `const splitted = path.split('/_next')`,
                    `return splitted.length === 2 ? splitted[0] : '';`,
                ]),
                '} catch (e) {',
                webpack_1.Template.indent([
                    `const path = document.currentScript && document.currentScript.src;`,
                    `console.error('failed generating CSR image path', e, path);`,
                    'return "";',
                ]),
                '}',
            ]),
            '}()',
        ])}`;
    const constructedObject = Object.entries(content).reduce((acc, [key, value]) => {
        if (key === 'src') {
            if (value && !value.includes('://')) {
                value = path_1.default.join(value);
            }
            acc.push(`${key}: computedAssetsPrefixReference + ${JSON.stringify(value)}`);
            return acc;
        }
        acc.push(`${key}: ${JSON.stringify(value)}`);
        return acc;
    }, []);
    return webpack_1.Template.asString([
        "let computedAssetsPrefixReference = '';",
        'try {',
        webpack_1.Template.indent(`computedAssetsPrefixReference = ${computedAssetPrefix};`),
        '} catch (e) {}',
        'export default {',
        webpack_1.Template.indent(constructedObject.join(',\n')),
        '}',
    ]);
}
exports.fixImageLoader = fixImageLoader;
exports.pitch = fixImageLoader;
//# sourceMappingURL=fixImageLoader.js.map