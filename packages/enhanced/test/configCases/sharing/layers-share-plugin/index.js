import './tests/different-layer.test';
import './tests/explicit.test';

// Test non-layered functionality
it('should provide and consume a normal library async in a separate shareScope', async () => {
  const { default: value } = await import('lib3');
  expect(value).toBe('lib3');
  expect(
    __webpack_share_scopes__.default && __webpack_share_scopes__.default.lib3,
  ).toBe(undefined);
  expect(typeof __webpack_share_scopes__.other.lib3).toBe('object');
});
