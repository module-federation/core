/**
 * Rewrites absolute `/_next/*` urls emitted by url-loader so federated remotes
 * resolve assets from the remote origin instead of the host origin.
 */
export default function fixUrlLoader(content: string): string {
  const assetPrefixExpression = [
    '(',
    "typeof __webpack_require__ !== 'undefined'",
    '&& __webpack_require__.p',
    "&& __webpack_require__.p.includes('/_next/')",
    "? __webpack_require__.p.slice(0, __webpack_require__.p.lastIndexOf('/_next/'))",
    ": ''",
    ')',
  ].join(' ');

  return content.replace(
    'export default "/',
    `export default ${assetPrefixExpression} + "/`,
  );
}
