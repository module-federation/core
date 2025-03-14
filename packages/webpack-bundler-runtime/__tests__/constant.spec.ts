import { FEDERATION_SUPPORTED_TYPES } from '../src/constant';

describe('Constants', () => {
  test('FEDERATION_SUPPORTED_TYPES should contain script type', () => {
    expect(FEDERATION_SUPPORTED_TYPES).toEqual(['script']);
  });
});
