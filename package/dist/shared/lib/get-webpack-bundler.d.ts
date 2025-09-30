import { webpack } from 'next/dist/compiled/webpack/webpack';
/**
 * Depending on if Rspack is active or not, returns the appropriate set of
 * webpack-compatible api.
 *
 * @returns webpack bundler
 */
export default function getWebpackBundler(): typeof webpack;
