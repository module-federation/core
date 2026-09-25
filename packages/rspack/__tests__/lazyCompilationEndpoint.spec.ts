import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import lazyCompilationEndpointLoader, {
  rebaseLazyCompilationEndpoint,
} from '../src/lazyCompilationEndpointLoader';
import {
  LazyCompilationEndpointPlugin,
  RSPACK_LAZY_COMPILATION_WEB_CLIENT,
} from '../src/LazyCompilationEndpointPlugin';

const rspackClientPath =
  require.resolve('@rspack/core/hot/lazy-compilation-web.js');
const rspackClient = fs.readFileSync(rspackClientPath, 'utf-8');

// Runs a lazy compilation client the way Rspack would, and returns the URL
// its first request goes to.
function requestedUrl(
  source: string,
  endpoint: string,
  publicPath: string,
  page: string,
) {
  const opened: string[] = [];
  class XMLHttpRequest {
    open(_method: string, url: string) {
      opened.push(url);
    }
    setRequestHeader() {}
    send() {}
  }
  class EventSource {
    constructor(url: string) {
      opened.push(url);
    }
  }
  const activate = new Function(
    'XMLHttpRequest',
    'EventSource',
    '__resourceQuery',
    '__webpack_public_path__',
    'self',
    source
      .replace('export const activate =', 'return')
      .replace('import.meta.webpackHot', 'undefined'),
  )(
    XMLHttpRequest,
    EventSource,
    `?${encodeURIComponent(endpoint)}`,
    publicPath,
    { location: { href: page } },
  );
  activate({ data: 'module', active: true, onError() {} });
  return opened[0];
}

function rebased(source = rspackClient) {
  const result = rebaseLazyCompilationEndpoint(source);
  if (result === undefined) {
    throw new Error('client was not rebased');
  }
  return result;
}

describe('lazy compilation endpoint rebase', () => {
  it('sends a remote request to the remote, not the host page', () => {
    const args = [
      '/_rspack/lazy/trigger',
      'http://localhost:3011/',
      'http://localhost:3013/preload',
    ] as const;
    expect(requestedUrl(rspackClient, ...args)).toBe('/_rspack/lazy/trigger');
    expect(requestedUrl(rebased(), ...args)).toBe(
      'http://localhost:3011/_rspack/lazy/trigger',
    );
  });

  it('keeps an absolute or protocol-relative serverUrl', () => {
    expect(
      requestedUrl(
        rebased(),
        'http://localhost:4000/_rspack/lazy/trigger',
        'http://localhost:3011/',
        'http://localhost:3013/',
      ),
    ).toBe('http://localhost:4000/_rspack/lazy/trigger');
    expect(
      requestedUrl(
        rebased(),
        '//localhost:2001/_rspack/lazy/trigger',
        'http://localhost:2001/',
        'http://localhost:3013/',
      ),
    ).toBe('http://localhost:2001/_rspack/lazy/trigger');
  });

  it('keeps the endpoint path and uses only the public path origin', () => {
    expect(
      requestedUrl(
        rebased(),
        '/_rspack/lazy/trigger__0',
        'http://localhost:3011/static/',
        'http://localhost:3013/',
      ),
    ).toBe('http://localhost:3011/_rspack/lazy/trigger__0');
  });

  it('falls back to the page for a relative public path', () => {
    expect(
      requestedUrl(
        rebased(),
        '/_rspack/lazy/trigger',
        '/',
        'http://localhost:3011/app',
      ),
    ).toBe('http://localhost:3011/_rspack/lazy/trigger');
    expect(
      requestedUrl(rebased(), '/_rspack/lazy/trigger', '/', 'about:srcdoc'),
    ).toBe('/_rspack/lazy/trigger');
  });

  it('is idempotent', () => {
    expect(rebased(rebased())).toBe(rebased());
  });

  it('rebases the EventSource client of Rspack 1', () => {
    const rspack1Client = `
      var urlBase = decodeURIComponent(__resourceQuery.slice(1));
      export const activate = function (options) {
        new EventSource(urlBase + encodeURIComponent(options.data));
      };`;
    expect(
      requestedUrl(
        rebased(rspack1Client),
        '/lazy-compilation-using-',
        'http://localhost:3011/',
        'http://localhost:3013/',
      ),
    ).toBe('http://localhost:3011/lazy-compilation-using-module');
  });

  it('warns and keeps a client that no longer reads __resourceQuery', () => {
    const emitWarning = jest.fn();
    const source = 'export const activate = () => () => {};';
    expect(
      lazyCompilationEndpointLoader.call({ emitWarning } as any, source),
    ).toBe(source);
    expect(emitWarning).toHaveBeenCalledTimes(1);
    expect(emitWarning.mock.calls[0][0].message).toContain(
      'lazyCompilation.serverUrl',
    );
  });
});

describe('LazyCompilationEndpointPlugin', () => {
  it("matches only Rspack's web client", () => {
    const rules: any[] = [];
    new LazyCompilationEndpointPlugin().apply({
      options: { module: { rules } },
    } as any);
    expect(rules).toHaveLength(1);
    expect(rules[0].test).toBe(RSPACK_LAZY_COMPILATION_WEB_CLIENT);
    expect(RSPACK_LAZY_COMPILATION_WEB_CLIENT.test(rspackClientPath)).toBe(
      true,
    );
    expect(
      RSPACK_LAZY_COMPILATION_WEB_CLIENT.test(
        rspackClientPath.replace('-web.js', '-node.js'),
      ),
    ).toBe(false);
    expect(
      RSPACK_LAZY_COMPILATION_WEB_CLIENT.test('/app/my-lazy-client.js'),
    ).toBe(false);
  });

  // Runs real Rspack 2, which is ESM-only, in a child process against the
  // built package. Turbo builds the package before `test`.
  function compile(mode: 'remote' | 'host' | 'none') {
    const distEntry = path.resolve(__dirname, '../dist/index.js');
    if (!fs.existsSync(distEntry)) {
      throw new Error(
        'Build @module-federation/rspack before running this test.',
      );
    }
    return JSON.parse(
      execFileSync(
        process.execPath,
        [path.join(__dirname, 'fixtures/compile-lazy-remote.mjs'), mode],
        { encoding: 'utf-8' },
      ),
    );
  }

  it('rebases the lazy compilation client of a remote in a real build', () => {
    expect(compile('remote')).toEqual({
      error: null,
      errors: 0,
      lazyClient: true,
      rebased: true,
    });
    expect(compile('host')).toMatchObject({ lazyClient: true, rebased: false });
    expect(compile('none')).toMatchObject({ lazyClient: true, rebased: false });
  }, 60000);
});
