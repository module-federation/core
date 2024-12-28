it('should load the component from container and verify correct layer sources', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();

    // Verify that content comes from 2-layers-full
    expect(rendered).toContain('This is react 2.1.0');
    expect(rendered).toContain('This is layered react (2-layers-full)');

    // Verify that no content comes from 1-layers-full
    expect(rendered).not.toContain('This is react 1.1.0');
    expect(rendered).not.toContain('This is layered react (1-layers-full)');

    // Full string verification for complete assurance
    expect(rendered).toBe(
      'App rendered with [This is react 0.1.2] No Layer (1-layers-full) and LocalComponentALayers This is react 2.1.0 (Layered React: This is layered react (2-layers-full)) and LocalComponentALayers This is react 2.1.0 (Layered React: This is layered react (2-layers-full)) and [ComponentA rendered with [This is react 0.1.2]No Layer (1-layers-full)] and [LocalComponentB rendered with [This is react 0.1.2] No Layer (1-layers-full)] and LocalComponentB rendered with [This is react 0.1.2] No Layer (1-layers-full)',
    );
  });
});
