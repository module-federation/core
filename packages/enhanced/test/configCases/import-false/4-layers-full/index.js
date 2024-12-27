try {
  if (typeof it === 'undefined') {
    global.it = async function (a, b) {
      return await b();
    };
  }

  if (typeof expect === 'undefined') {
    global.expect = function (value) {
      return {
        toBe: (expected) => {
          if (value !== expected) {
            throw new Error(`Expected ${value} to be ${expected}`);
          }
        },
        toContain: (expected) => {
          if (!value.includes(expected)) {
            throw new Error(`Expected ${value} to contain ${expected}`);
          }
        },
      };
    };
  }
} catch (e) {
  console.log(e);
}

it('should load App with React and remote component', async () => {
  const App = (await import('./App')).default;
  const upgrade = (await import('./upgrade-react')).default;
  upgrade();
  const rendered = App();
  expect(rendered).toBe(
    'App rendered with React version: [This is react 1.2.3]\nand remote component: [ComponentA rendered with React version: [This is react 1.2.3]]',
  );
});
