import {
  getWebpackRequire,
  getWebpackRequireOrThrow,
  getWebpackShareScopes,
  getWebpackShareScopesOrThrow,
  initWebpackSharing,
} from '../src/bundler';

type MutableWebpackGlobals = typeof globalThis & {
  __webpack_require__?: unknown;
  __webpack_share_scopes__?: unknown;
  __webpack_init_sharing__?: unknown;
};

const webpackGlobals = globalThis as MutableWebpackGlobals;

describe('bundler helpers', () => {
  afterEach(() => {
    delete webpackGlobals.__webpack_require__;
    delete webpackGlobals.__webpack_share_scopes__;
    delete webpackGlobals.__webpack_init_sharing__;
    jest.restoreAllMocks();
  });

  it('returns undefined when webpack require is unavailable', () => {
    expect(getWebpackRequire()).toBeUndefined();
  });

  it('returns typed webpack require when available', () => {
    const webpackRequire = Object.assign(jest.fn(), { marker: 'typed' });
    webpackGlobals.__webpack_require__ = webpackRequire;

    const resolvedRequire = getWebpackRequire<typeof webpackRequire>();

    expect(resolvedRequire).toBe(webpackRequire);
    expect(resolvedRequire?.marker).toBe('typed');
  });

  it('returns webpack require in OrThrow helper when available', () => {
    const webpackRequire = Object.assign(jest.fn(), { marker: 'or-throw' });
    webpackGlobals.__webpack_require__ = webpackRequire;

    const resolvedRequire = getWebpackRequireOrThrow<typeof webpackRequire>();

    expect(resolvedRequire).toBe(webpackRequire);
    expect(resolvedRequire.marker).toBe('or-throw');
  });

  it('throws when webpack require is unavailable in OrThrow helper', () => {
    expect(() => getWebpackRequireOrThrow()).toThrow(
      'Unable to access __webpack_require__. Ensure this code runs inside a webpack-compatible runtime.',
    );
  });

  it('returns share scopes when available', () => {
    const shareScopes = { default: { react: { loaded: true } } };
    webpackGlobals.__webpack_share_scopes__ = shareScopes;

    const resolvedScopes = getWebpackShareScopes<typeof shareScopes>();

    expect(resolvedScopes).toBe(shareScopes);
    expect(resolvedScopes?.default.react.loaded).toBe(true);
  });

  it('returns share scopes in OrThrow helper when available', () => {
    const shareScopes = { default: { react: { loaded: true } } };
    webpackGlobals.__webpack_share_scopes__ = shareScopes;

    const resolvedScopes = getWebpackShareScopesOrThrow<typeof shareScopes>();

    expect(resolvedScopes).toBe(shareScopes);
    expect(resolvedScopes.default.react.loaded).toBe(true);
  });

  it('returns undefined for missing or invalid share scopes', () => {
    expect(getWebpackShareScopes()).toBeUndefined();

    webpackGlobals.__webpack_share_scopes__ = 'invalid';
    expect(getWebpackShareScopes()).toBeUndefined();
  });

  it('throws when share scopes are unavailable in OrThrow helper', () => {
    expect(() => getWebpackShareScopesOrThrow()).toThrow(
      'Unable to access __webpack_share_scopes__. Ensure this code runs inside a webpack-compatible runtime.',
    );
  });

  it('initializes webpack sharing when runtime helper is available', async () => {
    const initSharing = jest.fn().mockResolvedValue(undefined);
    webpackGlobals.__webpack_init_sharing__ = initSharing;

    await expect(initWebpackSharing('custom-scope')).resolves.toBeUndefined();
    expect(initSharing).toHaveBeenCalledWith('custom-scope');
  });

  it('throws when webpack sharing initializer is unavailable', () => {
    expect(() => initWebpackSharing()).toThrow(
      'Unable to access __webpack_init_sharing__. Ensure this code runs inside a webpack-compatible runtime.',
    );
  });
});
