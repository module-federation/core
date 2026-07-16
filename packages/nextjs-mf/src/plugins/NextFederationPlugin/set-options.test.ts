import { setOptions } from './set-options';

describe('setOptions', () => {
  it('generates federated stats by default', () => {
    const { extraOptions } = setOptions({
      name: 'host',
      extraOptions: {},
    });

    expect(extraOptions.skipFederatedStats).toBe(false);
  });

  it('preserves an explicit federated stats opt-out', () => {
    const { extraOptions } = setOptions({
      name: 'host',
      extraOptions: { skipFederatedStats: true },
    });

    expect(extraOptions.skipFederatedStats).toBe(true);
  });
});
