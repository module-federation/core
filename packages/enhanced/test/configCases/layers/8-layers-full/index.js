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
  global.it = async function (name, fn) {
    return await fn();
  };
}

it('should load App with React and both types of remote components', () => {
  // load container first so share exists
  return import('containerA/noop').then((m) => {

    return import('./App').then(({ default: App }) => {
      const rendered = App();
      expect(rendered).toBe(`App (no layer) rendered with React version: [This is react 0.1.2] with non-layered React value: [No Layer]
Local Component: LocalComponentA (in react-layer) rendered with React version: [This is react 0.1.2], layered React value: [react-layer]
Remote Component from container7: ComponentA (in react-layer) rendered with React version: [This is react 0.1.2] with layered React value: [react-layer]
Remote App from container7: App (no layer) rendered with React version: [This is react 0.1.2] with non-layered React value: [No Layer] and imported: ComponentA (in react-layer) rendered with React version: [This is react 0.1.2] with layered React value: [react-layer]`);
    });
  });
});
