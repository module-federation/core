import { getWebpackRequireOrThrow } from '@module-federation/sdk/bundler';
import { loadScript } from './pure';

jest.mock('@module-federation/sdk/bundler', () => ({
  getWebpackRequireOrThrow: jest.fn(),
}));

describe('loadScript', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not resolve webpack require when asyncContainer is already a promise', async () => {
    const asyncContainer = Promise.resolve({
      get: jest.fn(),
      init: jest.fn(),
    });

    const result = loadScript({ asyncContainer } as any);

    expect(result).toBe(asyncContainer);
    await expect(result).resolves.toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );
    expect(getWebpackRequireOrThrow).not.toHaveBeenCalled();
  });

  it('does not resolve webpack require when asyncContainer is a factory', async () => {
    const asyncContainer = Promise.resolve({
      get: jest.fn(),
      init: jest.fn(),
    });
    const asyncContainerFactory = jest.fn().mockReturnValue(asyncContainer);

    const result = loadScript({
      asyncContainer: asyncContainerFactory,
    } as any);

    expect(asyncContainerFactory).toHaveBeenCalledTimes(1);
    await expect(result).resolves.toEqual(
      expect.objectContaining({
        get: expect.any(Function),
        init: expect.any(Function),
      }),
    );
    expect(getWebpackRequireOrThrow).not.toHaveBeenCalled();
  });
});
