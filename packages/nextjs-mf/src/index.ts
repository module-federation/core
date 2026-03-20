import NextFederationPlugin, {
  NextFederationPlugin as NamedNextFederationPlugin,
} from './next-adapter';

export type { NextFederationPluginOptions } from './next-adapter';
export { NamedNextFederationPlugin as NextFederationPlugin };
export default NextFederationPlugin;

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = NextFederationPlugin;
  module.exports.NextFederationPlugin = NamedNextFederationPlugin;
}
