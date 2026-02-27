import NextFederationPlugin from './plugins/NextFederationPlugin';

export { NextFederationPlugin };
export default NextFederationPlugin;

if (
  process.env.IS_ESM_BUILD !== 'true' &&
  typeof module !== 'undefined' &&
  typeof module.exports !== 'undefined'
) {
  module.exports = NextFederationPlugin;
  module.exports.NextFederationPlugin = NextFederationPlugin;
}
