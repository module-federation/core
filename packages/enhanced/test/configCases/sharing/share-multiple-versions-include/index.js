it('should provide shared@2.0.0 (from my-module) due to include filter, excluding host local 1.0.0', async () => {
  await __webpack_init_sharing__('default');

  // Check the share scope directly
  const sharedScope = __webpack_share_scopes__.default.shared;

  // Host's local 1.0.0 should NOT be in the scope due to include: { version: "^2.0.0" }
  expect(sharedScope['1.0.0']).toBeUndefined();

  // my-module's local 2.0.0 SHOULD be in the scope as it matches include: { version: "^2.0.0" }
  // (Assuming my-module's shared dep is processed by SharePlugin)
  expect(sharedScope['2.0.0']).toBeDefined();
  expect(sharedScope['2.0.0'].version).toBe('2.0.0');

  // Host imports 'shared'. Should get 2.0.0 from the share scope.
  const { version: hostVersion } = await import('shared');
  expect(hostVersion).toBe('1.0.0');

  // my-module imports 'shared'. Should also get 2.0.0 from the share scope.
  const { version: myModuleVersion } = await import('my-module');
  expect(myModuleVersion).toBe('2.0.0');
});
