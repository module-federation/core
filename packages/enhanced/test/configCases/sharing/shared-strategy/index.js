it('should load the component from container', () => {
  return import('./App').then(({ default: App }) => {
    expect(App()).toBe('App rendered with [This is react 0.1.2]');

    const sharedStrategy =
      __webpack_require__.federation.initOptions.sharedStrategy;
    // name: "react", version: "0.1.2", eager: 0, singleton: 1, requiredVersion: "*", strictVersion: 0
    expect(sharedStrategy).toBe('version-first');
  });
});
