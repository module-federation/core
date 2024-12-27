if (typeof expect === 'undefined') {
  global.expect = function (actual) {
    return {
      toContain: function (expected) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected "${actual}" to contain "${expected}"`);
        }
      },
      toBe: function (expected) {
        if (actual !== expected) {
          throw new Error(`Expected "${actual}" to be "${expected}"`);
        }
      },
    };
  };
}

if (typeof it === 'undefined') {
  global.it = function (name, fn) {
    return fn();
  };
}
it('should load App with React', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();
    expect(rendered).toBe(
      'App rendered with [This is react 0.1.2] with layered value: [No Layer] and ComponentA rendered with React version: [This is react 0.1.2] with layer [react-layer]',
    );
  });
});
