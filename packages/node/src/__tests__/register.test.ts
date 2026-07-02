const mockRegister = jest.fn();

jest.mock('node:module', () => ({
  ...jest.requireActual('node:module'),
  register: mockRegister,
}));

import {
  isNativeHttpLoaderSupported,
  registerNativeHttpLoader,
} from '../loader-hooks/register';
import {
  initialize,
  isOriginAllowed,
  resetNativeHttpLoaderStateForTesting,
} from '../loader-hooks/hooks';
import {
  MF_NATIVE_LOADER_HOSTS_ENV,
  type NativeHttpLoaderInitializeData,
} from '../loader-hooks/protocol';
import { clearNativeHttpLoaderStateForTesting } from '../loader-hooks/state';

const HOOKS_URL = 'file:///fake/loader-hooks/hooks.mjs';

afterEach(() => {
  clearNativeHttpLoaderStateForTesting();
  resetNativeHttpLoaderStateForTesting();
  delete process.env[MF_NATIVE_LOADER_HOSTS_ENV];
  jest.clearAllMocks();
});

describe('registerNativeHttpLoader', () => {
  it('reports support based on module.register availability', () => {
    expect(isNativeHttpLoaderSupported()).toBe(true);
  });

  it('registers the hooks module once and seeds allowed origins', () => {
    process.env[MF_NATIVE_LOADER_HOSTS_ENV] =
      'https://cdn.example.com, invalid entry,';

    const state = registerNativeHttpLoader({
      hooksUrl: HOOKS_URL,
      allowedOrigins: ['http://remotes.example.com/some/path'],
    });

    expect(mockRegister).toHaveBeenCalledTimes(1);
    const [specifier, options] = mockRegister.mock.calls[0];
    expect(specifier).toBe(HOOKS_URL);
    expect(options.data.allowedOrigins).toEqual(
      expect.arrayContaining([
        'http://remotes.example.com',
        'https://cdn.example.com',
      ]),
    );
    expect(options.transferList).toContain(options.data.port);

    expect(state?.enabled).toBe(true);
    expect(state?.allowedOrigins.has('https://cdn.example.com')).toBe(true);
  });

  it('is idempotent and merges new origins into the existing registration', () => {
    const first = registerNativeHttpLoader({ hooksUrl: HOOKS_URL });
    const second = registerNativeHttpLoader({
      hooksUrl: HOOKS_URL,
      allowedOrigins: ['https://late.example.com'],
    });

    expect(second).toBe(first);
    expect(mockRegister).toHaveBeenCalledTimes(1);
    expect(first?.allowedOrigins.has('https://late.example.com')).toBe(true);
  });

  it('completes the allowOrigin ack round-trip with the hooks side', async () => {
    const state = registerNativeHttpLoader({ hooksUrl: HOOKS_URL });
    expect(state).toBeDefined();

    // Wire the transferred port into the real hooks implementation, exactly
    // as Node would when invoking the hooks thread initialize().
    const data = mockRegister.mock.calls[0][1]
      .data as NativeHttpLoaderInitializeData;
    initialize(data);

    await state!.allowOrigin('https://dynamic.example.com/remoteEntry.js');
    expect(state!.allowedOrigins.has('https://dynamic.example.com')).toBe(true);
    expect(isOriginAllowed('https://dynamic.example.com/chunk.js')).toBe(true);

    // Already-allowed origins resolve immediately without another message.
    await expect(
      state!.allowOrigin('https://dynamic.example.com'),
    ).resolves.toBeUndefined();
  });
});
