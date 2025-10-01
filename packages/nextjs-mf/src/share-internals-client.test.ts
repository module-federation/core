import {
  getNextInternalsShareScopeClient,
  getPagesDirSharesClient,
  getAppDirSharesClient,
} from './share-internals-client';
import fs from 'fs';
import os from 'os';
import path from 'path';

// Mock getReactVersionSafely from ./internal-helpers
jest.mock('./internal-helpers', () => ({
  getReactVersionSafely: jest.fn(() => '18.2.0'),
  // Provide a safeRequireResolve mock that behaves like require.resolve with fallback
  safeRequireResolve: jest.fn((id: string, options?: any) => {
    try {
      return require.resolve(id, options);
    } catch {
      return id; // fall back to original id if not resolvable in test
    }
  }),
}));

const sanitizeForSnapshot = (
  value: unknown,
  replacements: Record<string, string>,
): unknown => {
  if (value instanceof RegExp) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForSnapshot(item, replacements));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => [
        key,
        sanitizeForSnapshot(val, replacements),
      ]),
    );
  }

  if (typeof value === 'string') {
    return Object.entries(replacements).reduce((acc, [needle, replacement]) => {
      return acc.includes(needle) ? acc.split(needle).join(replacement) : acc;
    }, value);
  }

  return value;
};

describe('getNextInternalsShareScopeClient', () => {
  let tempDir: string;

  // Helper to create a temp dir with a package.json for next
  const setupNextVersion = (version: string) => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-mf-test-'));
    const pkgPath = path.join(tempDir, 'node_modules', 'next', 'package.json');
    fs.mkdirSync(path.dirname(pkgPath), { recursive: true });
    fs.writeFileSync(pkgPath, JSON.stringify({ version }), 'utf8');
    return tempDir;
  };

  afterEach(() => {
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns the correct share scope for a client compiler (Next 15)', () => {
    const context = setupNextVersion('15.0.0');
    const compiler = {
      options: { name: 'client' },
      context,
    } as any;
    const result = getNextInternalsShareScopeClient(compiler);
    expect(
      sanitizeForSnapshot(result, {
        [process.cwd()]: '<rootDir>',
        [context]: '<nextContext>',
      }),
    ).toMatchSnapshot();
  });

  it('returns the correct share scope for a client compiler (Next 14)', () => {
    const context = setupNextVersion('14.0.0');
    const compiler = {
      options: { name: 'client' },
      context,
    } as any;
    const result = getNextInternalsShareScopeClient(compiler);
    expect(
      sanitizeForSnapshot(result, {
        [process.cwd()]: '<rootDir>',
        [context]: '<nextContext>',
      }),
    ).toMatchSnapshot();
  });

  it('returns an empty object for a non-client compiler', () => {
    const context = setupNextVersion('15.0.0');
    const compiler = {
      options: { name: 'server' },
      context,
    } as any;
    const result = getNextInternalsShareScopeClient(compiler);
    expect(result).toEqual({});
  });

  // Tests specifically for getPagesDirSharesClient
  describe('getPagesDirSharesClient', () => {
    it('returns the correct config for Next 15', () => {
      const context = setupNextVersion('15.0.0');
      const compiler = { context } as any;
      const result = getPagesDirSharesClient(compiler);
      expect(
        sanitizeForSnapshot(result, {
          [process.cwd()]: '<rootDir>',
          [context]: '<nextContext>',
        }),
      ).toMatchSnapshot();
    });

    it('returns the correct config for Next 14', () => {
      const context = setupNextVersion('14.0.0');
      const compiler = { context } as any;
      const result = getPagesDirSharesClient(compiler);
      expect(
        sanitizeForSnapshot(result, {
          [process.cwd()]: '<rootDir>',
          [context]: '<nextContext>',
        }),
      ).toMatchSnapshot();
    });
  });

  // Tests specifically for getAppDirSharesClient
  describe('getAppDirSharesClient', () => {
    it('returns the correct config for Next 15', () => {
      const context = setupNextVersion('15.0.0');
      const compiler = { context } as any;
      const result = getAppDirSharesClient(compiler);
      expect(
        sanitizeForSnapshot(result, {
          [process.cwd()]: '<rootDir>',
          [context]: '<nextContext>',
        }),
      ).toMatchSnapshot();
    });

    it('returns the correct config for Next 14', () => {
      const context = setupNextVersion('14.0.0');
      const compiler = { context } as any;
      const result = getAppDirSharesClient(compiler);
      expect(
        sanitizeForSnapshot(result, {
          [process.cwd()]: '<rootDir>',
          [context]: '<nextContext>',
        }),
      ).toMatchSnapshot();
    });
  });
});
