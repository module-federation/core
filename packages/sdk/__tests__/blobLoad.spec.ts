import { resolveSpec, rewriteModuleCode } from '../src/blobLoad';

describe('resolveSpec', () => {
  it('returns absolute urls untouched', () => {
    expect(resolveSpec('https://x.com/a.js', 'https://b.com/')).toBe(
      'https://x.com/a.js',
    );
    expect(resolveSpec('blob:abc', 'https://b.com/')).toBe('blob:abc');
    expect(resolveSpec('data:text/js,1', 'https://b.com/')).toBe(
      'data:text/js,1',
    );
  });

  it('resolves relative and absolute-path specifiers against the base', () => {
    expect(resolveSpec('./dep.js', 'https://b.com/app/entry.js')).toBe(
      'https://b.com/app/dep.js',
    );
    expect(resolveSpec('/root.js', 'https://b.com/app/entry.js')).toBe(
      'https://b.com/root.js',
    );
  });

  it('throws on bare specifiers', () => {
    expect(() => resolveSpec('react', 'https://b.com/')).toThrow(
      'bare specifier',
    );
  });
});

describe('rewriteModuleCode', () => {
  const url = 'https://b.com/app/entry.js';

  it('pins import.meta.url to the module url', () => {
    const { code } = rewriteModuleCode('const u = import.meta.url;', url);
    expect(code).toBe(`const u = ${JSON.stringify(url)};`);
  });

  it('routes dynamic import() through __mfDyn with the base url', () => {
    const { code } = rewriteModuleCode('const m = import("./x.js");', url);
    expect(code).toBe(`const m = __mfDyn(${JSON.stringify(url)},"./x.js");`);
  });

  it('collects static relative/absolute deps and leaves bare imports alone', () => {
    const src = `import a from "./a.js";\nexport { b } from "/b.js";\nimport c from "react";`;
    const { deps } = rewriteModuleCode(src, url);
    expect(deps.map((d) => d.spec).sort()).toEqual(['./a.js', '/b.js']);

    const aDep = deps.find((d) => d.spec === './a.js')!;
    expect(aDep.depUrl).toBe('https://b.com/app/a.js');
    expect(aDep.original).toBe('from "./a.js"');
    expect(aDep.quote).toBe('"');
  });

  it('collects side-effect imports', () => {
    const { deps } = rewriteModuleCode('import "./side.js";', url);
    expect(deps.map((d) => d.spec)).toEqual(['./side.js']);
  });
});

import {
  fetchText,
  loadModule,
  loadEsmEntryWithFetch,
  loadCssWithFetch,
} from '../src/blobLoad';

describe('fetchText', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  it('merges fetchOptions headers and returns response text', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('CODE'),
    });
    const text = await fetchText('https://b.com/e.js', {
      fetchOptions: { headers: { Authorization: 'Bearer t' } },
    });
    expect(text).toBe('CODE');
    const requestInit = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(requestInit.headers).toEqual({ Authorization: 'Bearer t' });
  });

  it('prefers customFetch when it returns a Response', async () => {
    const customFetch = jest.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('HOOKED'),
    } as any);
    const text = await fetchText('https://b.com/e.js', { customFetch });
    expect(customFetch).toHaveBeenCalled();
    expect(text).toBe('HOOKED');
    expect(global.fetch as jest.Mock).not.toHaveBeenCalled();
  });

  it('throws a descriptive error on non-ok responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve(''),
    });
    await expect(fetchText('https://b.com/e.js', {})).rejects.toThrow(
      'BlobLoaderNetworkError: 401',
    );
  });

  it('normalizes a Headers instance into the request init', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('CODE'),
    });
    await fetchText('https://b.com/e.js', {
      fetchOptions: { headers: new Headers({ Authorization: 'Bearer t' }) },
    });
    const init = (global.fetch as jest.Mock).mock.calls[0][1];
    expect(init.headers).toEqual({ authorization: 'Bearer t' });
  });
});

describe('loadModule', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    (global.URL as any).createObjectURL = jest.fn(() => `blob:`);
    loadModule.clearCache();
  });

  it('rewrites a static dep to a recursively-loaded blob url and caches by url', async () => {
    const files: Record<string, string> = {
      'https://b.com/entry.js': `import dep from "./dep.js";`,
      'https://b.com/dep.js': `export default 1;`,
    };
    (global.fetch as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve({ ok: true, text: () => Promise.resolve(files[url]) }),
    );
    const blobUrl = await loadModule('https://b.com/entry.js', {});
    expect(blobUrl).toMatch(/^blob:/);
    // recursively loads all dependencies
    expect(
      (global.fetch as jest.Mock).mock.calls.map((c) => c[0]).sort(),
    ).toEqual(['https://b.com/dep.js', 'https://b.com/entry.js']);
    // only fetches once and caches them, reload does not invoke more fetches
    await loadModule('https://b.com/entry.js', {});
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(2);
  });

  it('evicts a failed load from the cache so a later call retries', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Unavailable',
        text: () => Promise.resolve(''),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('export default 1;'),
      });
    await expect(loadModule('https://b.com/x.js', {})).rejects.toThrow(
      'BlobLoaderNetworkError: 503',
    );
    const blobUrl = await loadModule('https://b.com/x.js', {});
    expect(blobUrl).toMatch(/^blob:/);
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(2);
  });
});

describe('loadCssWithFetch', () => {
  beforeEach(() => {
    (global as any).fetch = jest
      .fn()
      .mockResolvedValue({ ok: true, text: () => Promise.resolve('.a{}') });
    (global.URL as any).createObjectURL = jest.fn(() => 'blob:css');
    loadModule.clearCache();
    document.head.innerHTML = '';
  });

  it('fetches css with headers and injects a single stylesheet, deduping repeat calls', async () => {
    await loadCssWithFetch({
      href: 'https://b.com/a.css',
      fetchOptions: { headers: { Authorization: 'Bearer t' } },
    });
    await loadCssWithFetch({
      href: 'https://b.com/a.css',
      fetchOptions: { headers: { Authorization: 'Bearer t' } },
    });
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
    const links = document.head.getElementsByTagName('link');
    expect(links.length).toBe(1);
    expect(links[0].rel).toBe('stylesheet');
    expect(links[0].href).toContain('blob:css');
  });

  it('dedupes concurrent loads of the same href (single fetch, single link)', async () => {
    let resolveFetch: (v: any) => void;
    (global as any).fetch = jest.fn().mockImplementation(
      () =>
        new Promise((r) => {
          resolveFetch = r;
        }),
    );
    (global.URL as any).createObjectURL = jest.fn(() => 'blob:css');
    loadModule.clearCache();
    document.head.innerHTML = '';
    const p1 = loadCssWithFetch({ href: 'https://b.com/c.css' });
    const p2 = loadCssWithFetch({ href: 'https://b.com/c.css' });
    resolveFetch!({ ok: true, text: () => Promise.resolve('.c{}') });
    await Promise.all([p1, p2]);
    expect((global.fetch as jest.Mock).mock.calls.length).toBe(1);
    expect(document.head.getElementsByTagName('link').length).toBe(1);
  });
});
