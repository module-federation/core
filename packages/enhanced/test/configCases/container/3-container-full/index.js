if (global.__FEDERATION__) {
  global.__GLOBAL_LOADING_REMOTE_ENTRY__ = {};
  //@ts-ignore
  global.__FEDERATION__.__INSTANCES__.map((i) => {
    i.moduleCache.clear();
    if (global[i.name]) {
      delete global[i.name];
    }
  });
  global.__FEDERATION__.__INSTANCES__ = [];
}

it('should load the component from container', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();
    expect(rendered).toBe(
      'App rendered with [This is react 2.1.0] and [ComponentC rendered with [This is react 2.1.0] and [ComponentA rendered with [This is react 2.1.0]] and [ComponentB rendered with [This is react 2.1.0]]]',
    );
    return import('./upgrade-react').then(({ default: upgrade }) => {
      upgrade();
      const rendered = App();
      expect(rendered).toBe(
        'App rendered with [This is react 9] and [ComponentC rendered with [This is react 9] and [ComponentA rendered with [This is react 9]] and [ComponentB rendered with [This is react 9]]]',
      );
    });
  });
});
