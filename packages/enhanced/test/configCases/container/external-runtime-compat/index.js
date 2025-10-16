const instantiateRemote = require('./remote');
const runtime = require('../../../../../../packages/runtime/dist/index.cjs.cjs');

it('should instantiate ModuleFederation when external runtime constructor is unset', () => {
  const constructorGetter = runtime.getGlobalFederationConstructor;
  if (typeof constructorGetter === 'function') {
    expect(constructorGetter()).toBeUndefined();
  } else {
    expect(constructorGetter).toBeUndefined();
  }
  const instance = instantiateRemote();
  expect(instance).toBeInstanceOf(runtime.ModuleFederation);
  expect(instance.name).toBe('remote-using-module-federation');
});
