import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  assertModeRouterCompatibility,
  assertUnsupportedAppRouterTargets,
  detectRouterPresence,
} from './app';

function createTempAppDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'nextjs-mf-v9-test-'));
}

describe('core/features/app', () => {
  it('detects pages and app routers by directory', () => {
    const cwd = createTempAppDir();
    fs.mkdirSync(path.join(cwd, 'pages'), { recursive: true });
    fs.mkdirSync(path.join(cwd, 'app'), { recursive: true });

    expect(detectRouterPresence(cwd)).toEqual({ hasPages: true, hasApp: true });
  });

  it('throws when mode pages is used with app router', () => {
    expect(() => assertModeRouterCompatibility('pages', true)).toThrow(
      '[NMF004]',
    );
  });

  it('throws on route handler exposes', () => {
    const cwd = createTempAppDir();
    fs.mkdirSync(path.join(cwd, 'app', 'api', 'health'), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, 'app', 'api', 'health', 'route.ts'),
      'export const GET = () => new Response("ok")',
    );

    expect(() =>
      assertUnsupportedAppRouterTargets(cwd, {
        './health': './app/api/health/route.ts',
      }),
    ).toThrow('[NMF004]');
  });

  it('throws on extensionless route handler exposes', () => {
    const cwd = createTempAppDir();
    fs.mkdirSync(path.join(cwd, 'app', 'api', 'health'), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, 'app', 'api', 'health', 'route.ts'),
      'export const GET = () => new Response("ok")',
    );

    expect(() =>
      assertUnsupportedAppRouterTargets(cwd, {
        './health': './app/api/health/route',
      }),
    ).toThrow('[NMF004]');
  });

  it('throws on aliased route handler exposes', () => {
    const cwd = createTempAppDir();
    fs.mkdirSync(path.join(cwd, 'app', 'api', 'health'), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, 'app', 'api', 'health', 'route.ts'),
      'export const GET = () => new Response("ok")',
    );

    expect(() =>
      assertUnsupportedAppRouterTargets(cwd, {
        './health': '@/app/api/health/route',
      }),
    ).toThrow('[NMF004]');
  });

  it('throws on use server exposes', () => {
    const cwd = createTempAppDir();
    fs.mkdirSync(path.join(cwd, 'app', 'actions'), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, 'app', 'actions', 'save.ts'),
      `'use server';\nexport async function save() {}`,
    );

    expect(() =>
      assertUnsupportedAppRouterTargets(cwd, {
        './save': './app/actions/save.ts',
      }),
    ).toThrow('[NMF004]');
  });
});
