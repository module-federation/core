it('should load the component from container', () => {
  return import('./App').then(({ default: RemoteModules }) => {
    const graph = RemoteModules();

    // Verify that at least one key includes 'webpack-bundler-runtime/dist/embedded'
    const hasEmbeddedRuntime = Object.keys(graph).some((key) =>
      key.includes('webpack-bundler-runtime/dist/embedded'),
    );
    expect(hasEmbeddedRuntime).toBe(true);

    // Ensure no keys contain 'runtime/dist'
    Object.keys(graph).forEach((key) => {
      if (key.includes('/runtime/dist/embedded')) return;
      expect(key.includes('/runtime/dist')).toBe(false);
    });
  });
});
