/**
 * Rewrites absolute `/_next/*` urls emitted by url-loader so federated remotes
 * resolve assets from the remote origin instead of the host origin.
 */
export default function fixUrlLoader(content: string): string {
  const assetPrefixExpression = [
    '(function resolveFederatedAssetPrefix(){',
    'try {',
    "const publicPath = typeof __webpack_require__ !== 'undefined' ? __webpack_require__.p : '';",
    "const hostname = typeof publicPath === 'string' ? publicPath.replace(/(.+\\:\\/\\/[^\\/]+){0,1}\\/.*/i, '$1') : '';",
    "const globalThisVal = new Function('return globalThis')();",
    'const federationRoot = globalThisVal.__FEDERATION__;',
    "if (!federationRoot || !Array.isArray(federationRoot.__INSTANCES__)) return '';",
    'const currentInstance = __webpack_require__ && __webpack_require__.federation && __webpack_require__.federation.instance;',
    "const name = currentInstance && typeof currentInstance.name === 'string' ? currentInstance.name : '';",
    "if (!name) return '';",
    'for (const instance of federationRoot.__INSTANCES__) {',
    'if (!instance) continue;',
    'const moduleCache = instance.moduleCache;',
    'if (moduleCache && moduleCache.get) {',
    'const container = moduleCache.get(name);',
    'const remoteInfo = container && container.remoteInfo;',
    "const remoteEntry = remoteInfo && typeof remoteInfo.entry === 'string' ? remoteInfo.entry : '';",
    "if (remoteEntry.includes('/_next/')) {",
    "return remoteEntry.slice(0, remoteEntry.lastIndexOf('/_next/'));",
    '}',
    '}',
    '}',
    '}',
    'return hostname;',
    '} catch (_error) {}',
    "return '';",
    '})()',
  ].join(' ');

  return content.replace(
    'export default "/',
    `export default ${assetPrefixExpression} + "/`,
  );
}
