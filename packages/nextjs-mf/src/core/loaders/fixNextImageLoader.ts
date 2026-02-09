import type { LoaderContext } from 'webpack';
import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const { Template } = require(
  normalizeWebpackPath('webpack'),
) as typeof import('webpack');

type ImageModuleShape = Record<string, unknown>;

function buildServerAssetPrefixExpression(publicPathRef: string): string {
  return Template.asString([
    '(function resolveServerAssetPrefix(){',
    Template.indent([
      `const publicPath = ${publicPathRef};`,
      'try {',
      Template.indent([
        "const globalThisVal = new Function('return globalThis')();",
        'const federationRoot = globalThisVal.__FEDERATION__;',
        "if (!federationRoot || !Array.isArray(federationRoot.__INSTANCES__)) return '';",
        'const currentInstance = __webpack_require__.federation && __webpack_require__.federation.instance;',
        "const name = currentInstance && typeof currentInstance.name === 'string' ? currentInstance.name : '';",
        "if (!name) return '';",
        'for (const instance of federationRoot.__INSTANCES__) {',
        Template.indent([
          'if (!instance) continue;',
          'const moduleCache = instance.moduleCache;',
          'if (moduleCache && moduleCache.get) {',
          Template.indent([
            'const container = moduleCache.get(name);',
            'const remoteInfo = container && container.remoteInfo;',
            "const remoteEntry = remoteInfo && typeof remoteInfo.entry === 'string' ? remoteInfo.entry : '';",
            "if (remoteEntry.includes('/_next/')) {",
            Template.indent([
              "return remoteEntry.slice(0, remoteEntry.lastIndexOf('/_next/'));",
            ]),
            '}',
          ]),
          '}',
        ]),
        '}',
      ]),
      '} catch (_error) {}',
      "if (typeof publicPath === 'string' && publicPath.includes('://') && publicPath.includes('/_next/')) {",
      Template.indent([
        "return publicPath.slice(0, publicPath.lastIndexOf('/_next/'));",
      ]),
      '}',
      "return '';",
    ]),
    '})()',
  ]);
}

function buildClientAssetPrefixExpression(publicPathRef: string): string {
  return Template.asString([
    '(function resolveClientAssetPrefix(){',
    Template.indent([
      'try {',
      Template.indent([
        `const publicPath = ${publicPathRef};`,
        "let assetPrefix = '';",
        "if (typeof publicPath === 'string' && publicPath.includes('://') && publicPath.includes('/_next/')) {",
        Template.indent([
          "assetPrefix = publicPath.slice(0, publicPath.lastIndexOf('/_next/'));",
        ]),
        '}',
        'if (!assetPrefix) {',
        Template.indent([
          'const currentScript = document.currentScript && document.currentScript.src;',
          "if (typeof currentScript === 'string' && currentScript.includes('/_next/')) {",
          Template.indent([
            "assetPrefix = currentScript.slice(0, currentScript.lastIndexOf('/_next/'));",
          ]),
          '}',
        ]),
        '}',
        'if (!assetPrefix) {',
        Template.indent([
          'try {',
          Template.indent([
            "const globalThisVal = new Function('return globalThis')();",
            'const federationRoot = globalThisVal.__FEDERATION__;',
            'if (federationRoot && Array.isArray(federationRoot.__INSTANCES__)) {',
            Template.indent([
              'const currentInstance = __webpack_require__.federation && __webpack_require__.federation.instance;',
              "const name = currentInstance && typeof currentInstance.name === 'string' ? currentInstance.name : '';",
              'if (name) {',
              Template.indent([
                'for (const instance of federationRoot.__INSTANCES__) {',
                Template.indent([
                  'if (!instance) continue;',
                  'const moduleCache = instance.moduleCache;',
                  'if (moduleCache && moduleCache.get) {',
                  Template.indent([
                    'const container = moduleCache.get(name);',
                    'const remoteInfo = container && container.remoteInfo;',
                    "const remoteEntry = remoteInfo && typeof remoteInfo.entry === 'string' ? remoteInfo.entry : '';",
                    "if (remoteEntry.includes('/_next/')) {",
                    Template.indent([
                      "assetPrefix = remoteEntry.slice(0, remoteEntry.lastIndexOf('/_next/'));",
                      'break;',
                    ]),
                    '}',
                  ]),
                  '}',
                ]),
                '}',
              ]),
              '}',
            ]),
            '}',
          ]),
          '} catch (_error) {}',
        ]),
        '}',
        'return assetPrefix;',
      ]),
      '} catch (_error) {}',
      "return '';",
    ]),
    '})()',
  ]);
}

function shouldPrefixValue(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return false;
  }

  return (
    value.startsWith('/_next/') ||
    value.startsWith('/_next/image?') ||
    value.includes('%2F_next%2F')
  );
}

function toLiteralValue(value: unknown): string {
  return JSON.stringify(value);
}

export async function fixNextImageLoader(
  this: LoaderContext<Record<string, unknown>>,
  remaining: string,
): Promise<string> {
  this.cacheable(true);

  const isServer = this._compiler?.options?.name !== 'client';
  const publicPathRef =
    this._compiler?.webpack?.RuntimeGlobals?.publicPath ?? '';

  const result = await this.importModule(
    `${this.resourcePath}.webpack[javascript/auto]!=!${remaining}`,
  );

  const content = (result.default || result) as ImageModuleShape;
  if (!content || typeof content !== 'object') {
    return `export default ${toLiteralValue(content)};`;
  }

  const assetPrefixExpression = isServer
    ? buildServerAssetPrefixExpression(publicPathRef)
    : buildClientAssetPrefixExpression(publicPathRef);

  const mappedEntries = Object.entries(content).map(([key, value]) => {
    if (shouldPrefixValue(value)) {
      return `${JSON.stringify(key)}: __nextmf_asset_prefix__ + ${JSON.stringify(value)}`;
    }

    return `${JSON.stringify(key)}: ${toLiteralValue(value)}`;
  });

  return Template.asString([
    "let __nextmf_asset_prefix__ = '';",
    'try {',
    Template.indent(`__nextmf_asset_prefix__ = ${assetPrefixExpression};`),
    Template.indent([
      "if (typeof __nextmf_asset_prefix__ === 'string') {",
      Template.indent(
        "__nextmf_asset_prefix__ = __nextmf_asset_prefix__.replace(/\\/$/, '');",
      ),
      '} else {',
      Template.indent("__nextmf_asset_prefix__ = '';"),
      '}',
    ]),
    '} catch (_error) {',
    Template.indent("__nextmf_asset_prefix__ = '';"),
    '}',
    'export default {',
    Template.indent(mappedEntries.join(',\n')),
    '};',
  ]);
}

export const pitch = fixNextImageLoader;
