import fs from 'node:fs';
import { LazyCompilationClientPlugin } from '../src/LazyCompilationClientPlugin';

const rspackClient =
  '/repo/node_modules/.pnpm/@rspack+core@2.1.10/node_modules/@rspack/core/hot/lazy-compilation-web.js';
const query = `?${encodeURIComponent('/_rspack/lazy/trigger')}`;
const federationClient = require.resolve('../client/lazy-compilation-web.js');

// Mirrors Rspack's native NormalModuleReplacementPlugin: the regex is tested
// against the request, and the callback only runs on a match.
function resolveClientRequest(request: string, rspackVersion = '2.1.10') {
  const data = { request };
  class NormalModuleReplacementPlugin {
    constructor(
      private regExp: RegExp,
      private newResource: (data: { request: string }) => void,
    ) {}

    apply() {
      if (this.regExp.test(data.request)) {
        this.newResource(data);
      }
    }
  }
  new LazyCompilationClientPlugin().apply({
    webpack: { rspackVersion, NormalModuleReplacementPlugin },
  } as any);
  return data.request;
}

describe('LazyCompilationClientPlugin', () => {
  it('swaps the Rspack 2 web client and keeps the endpoint query', () => {
    expect(resolveClientRequest(rspackClient + query)).toBe(
      federationClient + query,
    );
    expect(resolveClientRequest(rspackClient)).toBe(federationClient);
  });

  it('leaves other requests alone', () => {
    const nodeClient = rspackClient.replace('-web.js', '-node.js') + query;
    expect(resolveClientRequest('./src/Button')).toBe('./src/Button');
    expect(resolveClientRequest(nodeClient)).toBe(nodeClient);
    expect(resolveClientRequest('/app/my-lazy-client.js' + query)).toBe(
      '/app/my-lazy-client.js' + query,
    );
  });

  it('does nothing on Rspack 1, which uses another client protocol', () => {
    expect(resolveClientRequest(rspackClient + query, '1.6.8')).toBe(
      rspackClient + query,
    );
  });
});

function postedUrl(endpoint: string, publicPath: string, page: string) {
  const source = fs
    .readFileSync(federationClient, 'utf-8')
    .replace('export const activate =', 'return')
    .replace('import.meta.webpackHot', 'undefined');
  const opened: string[] = [];
  class XMLHttpRequest {
    open(_method: string, url: string) {
      opened.push(url);
    }
    setRequestHeader() {}
    send() {}
  }
  const activate = new Function(
    'XMLHttpRequest',
    '__resourceQuery',
    '__webpack_public_path__',
    'self',
    source,
  )(XMLHttpRequest, `?${encodeURIComponent(endpoint)}`, publicPath, {
    location: { href: page },
  });
  activate({ data: 'module', active: true, onError() {} });
  return opened[0];
}

describe('remote lazy compilation client', () => {
  it('posts to the remote origin instead of the host page', () => {
    expect(
      postedUrl(
        '/_rspack/lazy/trigger',
        'http://localhost:3011/',
        'http://localhost:3013/preload',
      ),
    ).toBe('http://localhost:3011/_rspack/lazy/trigger');
  });

  it('keeps an explicit serverUrl and falls back to the page', () => {
    expect(
      postedUrl(
        'http://localhost:4000/_rspack/lazy/trigger',
        'http://localhost:3011/',
        'http://localhost:3013/',
      ),
    ).toBe('http://localhost:4000/_rspack/lazy/trigger');
    expect(
      postedUrl('/_rspack/lazy/trigger', '/', 'http://localhost:3011/app'),
    ).toBe('http://localhost:3011/_rspack/lazy/trigger');
  });
});
