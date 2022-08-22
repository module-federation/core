/**
 * This loader was specially created for tunning next-image-loader result
 *   see https://github.com/vercel/next.js/blob/canary/packages/next/build/webpack/loaders/next-image-loader.js
 * It takes regular string
 *   `export default {"src":"/_next/static/media/ssl.e3019f0e.svg","height":20,"width":20};`
 * And injects PUBLIC_PATH to it from webpack
 *   `export default {"src":__webpack_require__.p+"/static/media/ssl.e3019f0e.svg","height":20,"width":20};`
 *
 *
 * __webpack_require__.p - is a global variable in webpack container which contains publicPath
 *   For example:  http://localhost:3000/_next
 *
 * @type {(this: import("webpack").LoaderContext<{}>, content: string) => string>}
 */
function fixImageLoader(content) {
  // replace(/(.+\:\/\/[^\/]+){0,1}\/.*/i, '$1')
  //    this regexp will extract the hostname from publicPath
  //    http://localhost:3000/_next/... -> http://localhost:3000
  const currentHostnameCode =
    "__webpack_require__.p.replace(/(.+\\:\\/\\/[^\\/]+){0,1}\\/.*/i, '$1')";

  return content.replace('"src":', `"src":${currentHostnameCode}+`);
}

module.exports = fixImageLoader;
