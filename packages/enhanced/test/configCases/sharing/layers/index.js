import * as React from 'react';

it('should load different versions from different layers', () => {
  expect(React.version).toBe('1.0.0');
  expect(__webpack_modules__['./node_modules/react/index.js']);
});
