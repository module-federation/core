it('loads a runtimePlugins entry that is relative to the working directory', () => {
  expect(globalThis.__runtimePluginCwdRelative).toBe(true);
});
