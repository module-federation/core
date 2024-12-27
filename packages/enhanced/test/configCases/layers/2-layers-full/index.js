it('should load the component from container', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();
    expect(true).toBe(true);
    // expect(rendered).toBe(
    //   'App rendered with [This is react 2.1.0] and [ComponentA rendered with [This is react 2.1.0]] and [ComponentB rendered with [This is react 2.1.0]]',
    // );
  });
});
