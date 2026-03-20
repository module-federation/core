import type { LoaderContext } from '@rspack/core';

type AssetModuleExport =
  | string
  | {
      src?: string;
      blurDataURL?: string;
      [key: string]: unknown;
    };

const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z0-9+.-]*:)?\/\//i;
const DEFAULT_PUBLIC_PATH_EXPRESSION = '__webpack_require__.p';

type CompilerAwareLoaderContext = LoaderContext<Record<string, unknown>> & {
  _compiler?: {
    options?: {
      name?: string;
    };
    webpack?: {
      RuntimeGlobals?: {
        publicPath?: string;
      };
    };
  };
};

const serializeAssetModuleExport = (value: AssetModuleExport): string => {
  if (typeof value === 'string') {
    return `export default __nextjsMfResolveAssetUrl(${JSON.stringify(value)});`;
  }

  const serializedValue = JSON.stringify(value);

  return [
    `const assetModule = ${serializedValue};`,
    "if (assetModule && typeof assetModule.src === 'string') {",
    '  assetModule.src = __nextjsMfResolveAssetUrl(assetModule.src);',
    '}',
    "if (assetModule && typeof assetModule.blurDataURL === 'string') {",
    '  assetModule.blurDataURL = __nextjsMfResolveAssetUrl(assetModule.blurDataURL);',
    '}',
    'export default assetModule;',
  ].join('\n');
};

const getAssetBaseResolver = (
  isServer: boolean,
  publicPathExpression: string,
): string => {
  const sharedBody = [
    '  const getOrigin = (input) => {',
    "    const match = String(input || '').match(/^([a-z][a-z0-9+.-]*:\\/\\/[^/]+)/i);",
    '    return match ? match[1] : "";',
    '  };',
    '  const getBase = (input) => {',
    "    const value = String(input || '');",
    "    const parts = value.split('/_next');",
    '    if (parts.length === 2 && parts[0]) {',
    '      return parts[0];',
    '    }',
    '    return getOrigin(value);',
    '  };',
    `  const compileTimePublicPath = (() => {
    try {
      return ${publicPathExpression};
    } catch {
      return '';
    }
  })();`,
    '  const runtimePublicPath = typeof __webpack_require__ !== "undefined" && typeof __webpack_require__.p === "string" ? __webpack_require__.p : "";',
    '  const publicPathBase = getBase(runtimePublicPath || compileTimePublicPath);',
    '  if (publicPathBase) {',
    '    return publicPathBase;',
    '  }',
  ];

  if (!isServer) {
    return [
      'const __nextjsMfGetAssetBase = () => {',
      ...sharedBody,
      '  try {',
      '    const currentScript = document.currentScript && document.currentScript.src;',
      '    return getBase(currentScript);',
      '  } catch {',
      '    return "";',
      '  }',
      '};',
    ].join('\n');
  }

  return [
    'const __nextjsMfGetAssetBase = () => {',
    ...sharedBody,
    '  try {',
    "    const globalThisVal = new Function('return globalThis')();",
    '    const federationName = __webpack_require__?.federation?.instance?.name;',
    '    const instances = globalThisVal?.__FEDERATION__?.__INSTANCES__;',
    '    if (!federationName || !Array.isArray(instances)) {',
    '      return "";',
    '    }',
    '    for (const instance of instances) {',
    '      if (!instance?.moduleCache?.has?.(federationName)) {',
    '        continue;',
    '      }',
    '      const container = instance.moduleCache.get(federationName);',
    '      const remoteEntry = container?.remoteInfo?.entry;',
    '      const remoteBase = getBase(remoteEntry);',
    '      if (remoteBase) {',
    '        return remoteBase;',
    '      }',
    '    }',
    '  } catch {}',
    '  return "";',
    '};',
  ].join('\n');
};

export async function pitch(
  this: CompilerAwareLoaderContext,
  remaining: string,
) {
  this.cacheable(true);

  const isServer = this._compiler?.options?.name !== 'client';
  const publicPathExpression =
    this._compiler?.webpack?.RuntimeGlobals?.publicPath ||
    DEFAULT_PUBLIC_PATH_EXPRESSION;
  const result = await this.importModule(
    `${this.resourcePath}.webpack[javascript/auto]!=!${remaining}`,
  );
  const exportedValue = ((result as { default?: AssetModuleExport }).default ||
    result) as AssetModuleExport;

  return [
    getAssetBaseResolver(isServer, publicPathExpression),
    'const __nextjsMfResolveAssetUrl = (value) => {',
    "  if (typeof value !== 'string' || !value) {",
    '    return value;',
    '  }',
    `  if (${ABSOLUTE_URL_PATTERN}.test(value) || value.startsWith('data:') || value.startsWith('blob:')) {`,
    '    return value;',
    '  }',
    '  const assetBase = __nextjsMfGetAssetBase();',
    "  const publicPath = typeof __webpack_require__ !== 'undefined' && typeof __webpack_require__.p === 'string' ? __webpack_require__.p : '';",
    '  const originMatch = publicPath.match(/^([a-z][a-z0-9+.-]*:\\/\\/[^/]+)/i);',
    "  const origin = originMatch ? originMatch[1] : '';",
    "  if (value.startsWith('/_next/') || value.startsWith('/static/')) {",
    '    if (assetBase) {',
    '      return `${assetBase}${value}`;',
    '    }',
    '    return origin ? `${origin}${value}` : value;',
    '  }',
    '  if (!publicPath) {',
    '    return value;',
    '  }',
    '  try {',
    '    return new URL(value, publicPath).toString();',
    '  } catch {',
    "    return `${publicPath}${value.replace(/^\\//, '')}`;",
    '  }',
    '};',
    serializeAssetModuleExport(exportedValue),
  ].join('\n');
}
