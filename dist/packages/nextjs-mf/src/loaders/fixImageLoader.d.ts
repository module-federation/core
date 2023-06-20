import type { LoaderContext } from 'webpack';
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
export declare function fixImageLoader(this: LoaderContext<Record<string, unknown>>, remaining: string): Promise<string>;
export declare const pitch: typeof fixImageLoader;
