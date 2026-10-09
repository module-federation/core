import { normalizeWebpackPath } from '@module-federation/sdk/normalize-webpack-path';

const webpackMakeSerializable = require(
  normalizeWebpackPath('webpack/lib/util/makeSerializable'),
) as typeof import('webpack/lib/util/makeSerializable');

/**
 * Webpack's serializer registry is process-wide and throws on a duplicate key.
 * Naming each registration after this copy's install directory lets two copies
 * of enhanced (for example the app's and the one @module-federation/node
 * depends on) share one webpack, and keeps each copy's cache entries restored
 * by its own classes.
 */
export default function makeSerializable(
  Constructor: Parameters<typeof webpackMakeSerializable>[0],
  request: string,
): void {
  webpackMakeSerializable(Constructor, request, __dirname);
}
