it('should load App with React and remote component', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();
    expect(rendered).toContain('App rendered with React version:');
    expect(rendered).toContain('remote component:');
  });
});
