import { jest } from '@jest/globals';

const ORIGIN = 'http://example.com';

const createResponse = (body: string) => ({
  text: async () => body,
});

const setModuleFetchMock = (modules: Record<string, string>) => {
  const fetchMock = jest.fn(async (url: string) => {
    const body = modules[url];
    if (body === undefined) {
      throw new Error(`${url} should not be fetched`);
    }

    return createResponse(body.trim());
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  return fetchMock;
};

const loadNodeEsmScript = async <T = unknown>(
  url: string,
): Promise<{ error?: Error; namespace?: T }> => {
  const { createScriptNode } = await import('../src/node');

  return new Promise((resolve) => {
    createScriptNode(
      url,
      (error, scriptContext) =>
        resolve({ error, namespace: scriptContext as T }),
      { type: 'module' },
    );
  });
};

describe('Node ESM graphs that reach one module twice', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // `loadModule` publishes a module to its cache before linking it, so a
  // cyclic import can still see it. `link()` resolves a module's dependencies
  // concurrently, so a module reachable by two sibling paths could be handed
  // to the second path while its own linking was still in flight - leaving its
  // imports as unresolved requests on an unlinked module. That only became
  // observable once such a shared module had imports of its own.
  it('links a module reached by two sibling paths when it has imports of its own', async () => {
    setModuleFetchMock({
      [`${ORIGIN}/a.js`]: `
        import { c } from './c.js'
        import { b } from './b.js'
        export const a = 'a' + b + c
      `,
      [`${ORIGIN}/b.js`]: `
        import { c } from './c.js'
        export const b = 'b' + c
      `,
      [`${ORIGIN}/c.js`]: `
        import { d } from './d.js'
        export const c = 'c' + d
      `,
      [`${ORIGIN}/d.js`]: `export const d = 'd'`,
    });

    const { error, namespace } = await loadNodeEsmScript<{ a: string }>(
      `${ORIGIN}/a.js`,
    );

    expect(error).toBeUndefined();
    expect(namespace?.a).toBe('abcdcd');
  });

  it('links a module reached by two sibling paths when it has no imports', async () => {
    setModuleFetchMock({
      [`${ORIGIN}/a.js`]: `
        import { c } from './c.js'
        import { b } from './b.js'
        export const a = 'a' + b + c
      `,
      [`${ORIGIN}/b.js`]: `
        import { c } from './c.js'
        export const b = 'b' + c
      `,
      [`${ORIGIN}/c.js`]: `export const c = 'c'`,
    });

    const { error, namespace } = await loadNodeEsmScript<{ a: string }>(
      `${ORIGIN}/a.js`,
    );

    expect(error).toBeUndefined();
    expect(namespace?.a).toBe('abcc');
  });

  // b.js and c.js read each other's const export during evaluation, so native
  // Node links this graph and then throws a TDZ ReferenceError.
  it('reports the TDZ error rather than hanging when two siblings of the entry read each other during init', async () => {
    setModuleFetchMock({
      [`${ORIGIN}/a.js`]: `
        import { b } from './b.js'
        import { c } from './c.js'
        export const a = 'a' + b + c
      `,
      [`${ORIGIN}/b.js`]: `
        import { c } from './c.js'
        export const b = 'b' + c
      `,
      [`${ORIGIN}/c.js`]: `
        import { b } from './b.js'
        export const c = 'c' + b
      `,
    });

    const { error } = await loadNodeEsmScript(`${ORIGIN}/a.js`);

    expect(error?.message).toMatch(/Cannot access '.+' before initialization/);
  }, 15000);

  it('links two modules that import each other through function exports', async () => {
    setModuleFetchMock({
      [`${ORIGIN}/a.js`]: `
        import { b } from './b.js'
        export function a() { return 'a' + b() }
      `,
      [`${ORIGIN}/b.js`]: `
        import { a } from './a.js'
        export function b() { return 'b' }
      `,
    });

    const { error, namespace } = await loadNodeEsmScript<{
      a: () => string;
    }>(`${ORIGIN}/a.js`);

    expect(error).toBeUndefined();
    expect(namespace?.a()).toBe('ab');
  }, 15000);

  it('links an entry whose two sibling imports import each other through function exports', async () => {
    setModuleFetchMock({
      [`${ORIGIN}/a.js`]: `
        import { b } from './b.js'
        import { c } from './c.js'
        export const a = b() + c()
      `,
      [`${ORIGIN}/b.js`]: `
        import { c } from './c.js'
        export function b() { return 'b' + c() }
      `,
      [`${ORIGIN}/c.js`]: `
        import { b } from './b.js'
        export function c() { return 'c' }
        export function getB() { return b }
      `,
    });

    const { error, namespace } = await loadNodeEsmScript<{ a: string }>(
      `${ORIGIN}/a.js`,
    );

    expect(error).toBeUndefined();
    expect(namespace?.a).toBe('bcc');
  }, 15000);
});
