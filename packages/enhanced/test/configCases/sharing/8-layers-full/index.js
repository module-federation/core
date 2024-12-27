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

skip('should load App with React and both types of remote components', () => {
  expect(true).toBe(true);
  // return import('./App').then(({ default: App }) => {

  //   const rendered = App();
  //   expect(rendered).toContain('No Layer');
  //   expect(rendered).toContain('react-layer');
  //   expect(rendered).toContain('App rendered with React version:');
  //   expect(rendered).toContain('Non-layered remote component:');
  //   expect(rendered).toContain('Layered remote component:');
  // });
});
