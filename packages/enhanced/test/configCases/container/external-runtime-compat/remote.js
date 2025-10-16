const runtime = require('../../../../../../packages/runtime/dist/index.cjs.cjs');

module.exports = function instantiateRemote() {
  const constructor =
    (typeof runtime.getGlobalFederationConstructor === 'function' &&
      runtime.getGlobalFederationConstructor()) ||
    runtime.ModuleFederation;

  if (typeof constructor !== 'function') {
    throw new Error('ModuleFederationMissing');
  }

  return new constructor({ name: 'remote-using-module-federation' });
};
