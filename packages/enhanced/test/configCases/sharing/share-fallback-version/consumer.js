// Test consumer with fallback version
// This file tests that fallbackVersion is used for filtering decisions

// React should be included because fallbackVersion (18.2.0) satisfies ^18.0.0
// even though the actual module version would be 17.0.2
const React = require('react');

// Vue should be excluded because fallbackVersion (3.0.0) satisfies the exclude filter ^3.0.0
// even though the actual module version (2.6.14) doesn't match
const Vue = require('vue');

// Lodash should NOT be included because fallbackVersion (4.17.0) doesn't satisfy include filter ^5.0.0
const _ = require('lodash');

it('should use fallbackVersion for filtering decisions', () => {
  expect(React).toBeDefined();
  expect(Vue).toBeDefined();
  expect(_).toBeDefined();
});
