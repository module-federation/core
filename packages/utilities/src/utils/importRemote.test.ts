import {
  getWebpackRequireOrThrow,
  getWebpackShareScopes,
  initWebpackSharing,
  importWithBundlerIgnore,
} from '@module-federation/sdk/bundler';
import { importRemote } from './importRemote';

jest.mock('@module-federation/sdk/bundler', () => ({
  getWebpackRequireOrThrow: jest.fn(),
  getWebpackShareScopes: jest.fn(),
  initWebpackSharing: jest.fn(),
  importWithBundlerIgnore: jest.fn(),
}));

describe('importRemote (esm)', () => {
  const scope = 'esmScope';

  beforeEach(() => {
    jest.clearAllMocks();
    (globalThis as any).window = {};
    (globalThis as any).__webpack_share_scopes__ = { default: {} };
    (globalThis as any).__webpack_init_sharing__ = jest
      .fn()
      .mockResolvedValue(undefined);
    (getWebpackShareScopes as jest.Mock).mockImplementation(
      () => (globalThis as any).__webpack_share_scopes__,
    );
    (initWebpackSharing as jest.Mock).mockImplementation(async () => {
      (globalThis as any).__webpack_share_scopes__ ||= {};
      (globalThis as any).__webpack_share_scopes__.default ||= {};
    });
  });

  afterEach(() => {
    delete (globalThis as any).window;
    delete (globalThis as any).__webpack_share_scopes__;
    delete (globalThis as any).__webpack_init_sharing__;
  });

  it('wraps immutable namespace before attaching runtime flags', async () => {
    const get = jest.fn().mockResolvedValue(() => 'esm-module');
    const init = jest.fn().mockResolvedValue(undefined);
    const namespace = Object.freeze({
      get,
      init,
    });
    (importWithBundlerIgnore as jest.Mock).mockResolvedValue(namespace);

    const loaded = await importRemote<string>({
      url: 'https://example.com/remote',
      scope,
      module: './module',
      esm: true,
      bustRemoteEntryCache: false,
    });

    expect(loaded).toBe('esm-module');
    expect(importWithBundlerIgnore).toHaveBeenCalledWith(
      'https://example.com/remote/remoteEntry.js',
    );

    const attachedContainer = (globalThis as any).window[scope];
    expect(attachedContainer).toBeDefined();
    expect(attachedContainer).not.toBe(namespace);
    expect(attachedContainer.__initialized).toBe(true);
    expect((namespace as any).__initialized).toBeUndefined();
    expect(get).toHaveBeenCalledWith('./module');
    expect(init).toHaveBeenCalledWith(
      (globalThis as any).__webpack_share_scopes__.default,
    );
    expect(getWebpackRequireOrThrow).not.toHaveBeenCalled();
  });
});
