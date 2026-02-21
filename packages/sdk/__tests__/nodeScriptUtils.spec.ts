import {
  patchNodeRemoteEntryCode,
  resolveNodeScriptExports,
} from '../src/nodeScriptUtils';

describe('nodeScriptUtils', () => {
  it('patches async startup entries and strips encoded hmr bootstrap calls', () => {
    const source = `
      var rscRemote;
      var __webpack_require__ = function(){};
      __webpack_require__.mfAsyncStartup = function () {};
      __webpack_require__("data:text/javascript,import%20%7B%20init%20%7D%20from%20'hmr.js'%3B");
      var __webpack_exports__ = __webpack_require__.x();
      rscRemote = __webpack_exports__;
    `;

    const patched = patchNodeRemoteEntryCode(source, {
      globalName: 'rscRemote',
    });

    expect(patched).toContain('__webpack_require__.x({}, []);');
    expect(patched).not.toContain('data:text/javascript');
    expect(patched).toContain('module.exports = rscRemote');
  });

  it('does not append module export shim for invalid global identifiers', () => {
    const source = `
      var __webpack_require__ = function(){};
      var __webpack_exports__ = __webpack_require__.x();
    `;

    const patched = patchNodeRemoteEntryCode(source, {
      globalName: '__FEDERATION_remote:key__',
    });

    expect(patched).not.toContain('module.exports = __FEDERATION_remote:key__');
  });

  it('resolves promise-like exports and falls back to global container', async () => {
    const key = '__FEDERATION_remote:key__';
    const globalContainer = { init: () => undefined, get: () => undefined };
    (globalThis as Record<string, unknown>)[key] = globalContainer;

    const resolvedFromPromise = await resolveNodeScriptExports(
      {
        exports: {},
        module: {
          exports: Promise.resolve({
            init: () => undefined,
            get: () => undefined,
          }),
        },
      },
      { globalName: key },
    );

    expect(typeof (resolvedFromPromise as Record<string, unknown>).init).toBe(
      'function',
    );

    const resolvedFromGlobal = await resolveNodeScriptExports(
      {
        exports: {},
        module: { exports: {} },
      },
      { globalName: key },
    );

    expect(resolvedFromGlobal).toBe(globalContainer);

    delete (globalThis as Record<string, unknown>)[key];
  });
});
