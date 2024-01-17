it('should load the component from container', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();
    expect(rendered).toBe(
      'App rendered with [This is react 2.3.4] and [ComponentA rendered with [This is react 2.3.4]]',
    );

    const hostIns = globalThis.__FEDERATION__.__INSTANCES__.find(
      (i) => i.name === 'consumer',
    );
    const providerIns = globalThis.__FEDERATION__.__INSTANCES__.find(
      (i) => i.name === 'provider',
    );
    expect(Boolean(hostIns)).toBe(true);
    expect(Boolean(providerIns)).toBe(true);
  });
});
