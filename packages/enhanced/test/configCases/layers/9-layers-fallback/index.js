it('should demonstrate layer fallback behavior for shared modules', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();

    console.log('Rendered:', rendered);

    // Expected behavior:
    // - App (no layer) should use unlayered lodash (4.17.21, unlayered-fallback)
    // - ComponentA (layer1) should use layer1-specific lodash (4.18.0, layer1-specific)
    // - ComponentB (layer2) should fallback to unlayered lodash but modified by loader (4.17.22, layer2-modified)

    expect(rendered).toContain('App (no layer) with lodash 4.17.21');
    expect(rendered).toContain('unlayered-fallback');

    expect(rendered).toContain('ComponentA (layer1) with lodash 4.18.0');
    expect(rendered).toContain('layer1-specific');

    expect(rendered).toContain('ComponentB (layer2) with lodash 4.17.22');
    expect(rendered).toContain('layer2-modified');

    // Full string verification
    expect(rendered).toBe(
      'App (no layer) with lodash 4.17.21: ComponentA (layer1) with lodash 4.18.0 (layer1-specific) | ComponentB (layer2) with lodash 4.17.22 (layer2-modified)',
    );
  });
});

it('should prefer layered config over unlayered fallback when both exist', () => {
  return import('./ComponentA').then(({ default: ComponentA }) => {
    const rendered = ComponentA();

    // ComponentA is in layer1 and should get the layer1-specific lodash
    // NOT the unlayered fallback, even though both exist
    expect(rendered).toContain('4.18.0');
    expect(rendered).toContain('layer1-specific');
    expect(rendered).not.toContain('unlayered-fallback');
  });
});

it('should fallback to unlayered config when no layered config exists', () => {
  return import('./ComponentB').then(({ default: ComponentB }) => {
    const rendered = ComponentB();

    // ComponentB is in layer2 but there's no layer2-specific lodash config
    // So it should fallback to the unlayered config (but modified by loader)
    expect(rendered).toContain('4.17.22'); // Modified by loader from 4.17.21
    expect(rendered).toContain('layer2-modified'); // Modified by loader from unlayered-fallback
  });
});
