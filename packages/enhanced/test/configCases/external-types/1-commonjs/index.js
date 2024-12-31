if (typeof it === 'undefined') {
  global.it = function (s, cb) {
    return cb();
  };
}

if (typeof expect === 'undefined') {
  global.expect = function (actual) {
    return {
      toBe: function (expected) {
        if (actual !== expected) {
          throw new Error(`Expected: ${expected}\nReceived: ${actual}`);
        }
        return true;
      },
    };
  };
}

it('should load the component from container', () => {
  return import('./App').then(({ default: App }) => {
    const rendered = App();
    expect(rendered).toBe(
      'App rendered with [This is react 2.1.0] and [ComponentB rendered with [This is react 2.1.0]]',
    );
    return import('./upgrade-react').then(({ default: upgrade }) => {
      upgrade();
      const rendered = App();
      expect(rendered).toBe(
        'App rendered with [This is react 3.2.1] and [ComponentB rendered with [This is react 3.2.1]]',
      );
    });
  });
});
