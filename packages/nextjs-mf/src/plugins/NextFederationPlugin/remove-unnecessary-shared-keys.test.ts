import { removeUnnecessarySharedKeys } from './remove-unnecessary-shared-keys';

describe('removeUnnecessarySharedKeys', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should remove unnecessary shared keys from the given object', () => {
    const shared: Record<string, unknown> = {
      react: '17.0.0',
      'react-dom': '17.0.0',
      lodash: '4.17.21',
    };

    removeUnnecessarySharedKeys(shared);

    expect(shared).toEqual({ lodash: '4.17.21' });
    expect(console.warn).toHaveBeenCalled();
  });

  it('should not remove keys that are not in the default share scope', () => {
    const shared: Record<string, unknown> = {
      lodash: '4.17.21',
      axios: '0.21.1',
    };

    removeUnnecessarySharedKeys(shared);

    expect(shared).toEqual({ lodash: '4.17.21', axios: '0.21.1' });
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should not remove keys from an empty object', () => {
    const shared: Record<string, unknown> = {};

    removeUnnecessarySharedKeys(shared);

    expect(shared).toEqual({});
    expect(console.warn).not.toHaveBeenCalled();
  });
});
