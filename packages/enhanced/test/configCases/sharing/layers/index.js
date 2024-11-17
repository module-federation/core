import * as React from 'react';
import * as ReactLayer1 from 'react/layer1';

it('should load different versions from different layers', () => {
  expect(React.version).toBe('1.0.0');
  expect(ReactLayer1.version).toBe('2.0.0');
});
