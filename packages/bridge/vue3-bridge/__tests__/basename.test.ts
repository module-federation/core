import { describe, expect, it } from '@rstest/core';
import {
  deriveBasenameFromRoute,
  resolveRemoteBasename,
  stripCatchAllPath,
} from '../src/basename';

describe('stripCatchAllPath', () => {
  it('strips Vue Router pathMatch catch-all', () => {
    expect(stripCatchAllPath('/remote1/:pathMatch(.*)*')).toBe('/remote1');
  });

  it('strips Nuxt-style path catch-all', () => {
    expect(stripCatchAllPath('/bridge/:path(.*)*')).toBe('/bridge');
  });

  it('strips generic named catch-all', () => {
    expect(stripCatchAllPath('/apps/:slug(.*)*')).toBe('/apps');
  });

  it('strips star catch-all', () => {
    expect(stripCatchAllPath('/remote/*')).toBe('/remote');
  });

  it('returns root for root catch-all', () => {
    expect(stripCatchAllPath('/:pathMatch(.*)*')).toBe('/');
    expect(stripCatchAllPath('/:path(.*)*')).toBe('/');
  });

  it('leaves non-catch-all paths unchanged', () => {
    expect(stripCatchAllPath('/bridge')).toBe('/bridge');
    expect(stripCatchAllPath('/')).toBe('/');
  });

  it('does not strip plain dynamic params', () => {
    expect(stripCatchAllPath('/users/:id')).toBe('/users/:id');
    expect(stripCatchAllPath('/users/:id(\\d+)')).toBe('/users/:id(\\d+)');
  });
});

describe('deriveBasenameFromRoute', () => {
  it('defaults to root without matched records', () => {
    expect(deriveBasenameFromRoute(undefined)).toBe('/');
    expect(deriveBasenameFromRoute({ matched: [] })).toBe('/');
  });

  it('uses Vue Router catch-all on matched[0]', () => {
    expect(
      deriveBasenameFromRoute({
        matched: [{ path: '/remote1/:pathMatch(.*)*' } as any],
      }),
    ).toBe('/remote1');
  });

  it('uses Nuxt catch-all pattern', () => {
    expect(
      deriveBasenameFromRoute({
        matched: [{ path: '/bridge/:path(.*)*' } as any],
      }),
    ).toBe('/bridge');
  });

  it('prefers the last catch-all when nested under a layout', () => {
    expect(
      deriveBasenameFromRoute({
        matched: [
          { path: '/apps' } as any,
          { path: '/apps/remote1/:pathMatch(.*)*' } as any,
        ],
      }),
    ).toBe('/apps/remote1');
  });

  it('falls back to first matched path when no catch-all', () => {
    expect(
      deriveBasenameFromRoute({
        matched: [{ path: '/apps' } as any, { path: '/apps/settings' } as any],
      }),
    ).toBe('/apps');
  });

  it('keeps nested dynamic params that are not catch-alls on matched[0]', () => {
    expect(
      deriveBasenameFromRoute({
        matched: [
          { path: '/tenant/:tenantId' } as any,
          { path: '/tenant/:tenantId/admin' } as any,
        ],
      }),
    ).toBe('/tenant/:tenantId');
  });
});

describe('resolveRemoteBasename', () => {
  it('prefers explicit basename over route derivation', () => {
    expect(
      resolveRemoteBasename({
        basename: '/explicit',
        route: {
          matched: [{ path: '/bridge/:path(.*)*' } as any],
        },
      }),
    ).toBe('/explicit');
  });

  it('derives from route when basename is omitted', () => {
    expect(
      resolveRemoteBasename({
        route: {
          matched: [{ path: '/bridge/:path(.*)*' } as any],
        },
      }),
    ).toBe('/bridge');
  });

  it('ignores empty explicit basename', () => {
    expect(
      resolveRemoteBasename({
        basename: '',
        route: {
          matched: [{ path: '/remote/:pathMatch(.*)*' } as any],
        },
      }),
    ).toBe('/remote');
  });
});
