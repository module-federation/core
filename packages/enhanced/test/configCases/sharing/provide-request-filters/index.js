if (Math.random() < 0) {
  require('lodash/get');
  require('lodash/set');
  require('react');
  require('pkg/a');
  require('lodash');
}

it('should test a string include filter against the prefix remainder', async () => {
  await __webpack_init_sharing__('default');
  expect(Object.keys(__webpack_share_scopes__.default)).toContain('lodash/get');
  expect(Object.keys(__webpack_share_scopes__.default)).not.toContain(
    'lodash/set',
  );
});

it('should test a string include filter against the direct request', async () => {
  await __webpack_init_sharing__('default');
  expect(Object.keys(__webpack_share_scopes__.default)).toContain('react');
});

it('should test a RegExp exclude filter against the request, not the resource path', async () => {
  await __webpack_init_sharing__('default');
  expect(Object.keys(__webpack_share_scopes__.default)).toContain('pkg/a');
});

it('should test a string include filter against the path after node_modules', async () => {
  await __webpack_init_sharing__('default');
  expect(Object.keys(__webpack_share_scopes__.default)).toContain(
    'lodash/map.js',
  );
  expect(Object.keys(__webpack_share_scopes__.default)).not.toContain(
    'lodash/pick.js',
  );
});
