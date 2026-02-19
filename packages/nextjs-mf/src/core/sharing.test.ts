import { normalizeNextFederationOptions } from './options';
import { getDefaultShared } from './sharing';

describe('sharing', () => {
  it('provides pages router core singletons for server', () => {
    const resolved = normalizeNextFederationOptions({
      name: 'home',
      mode: 'pages',
    });

    const shared = getDefaultShared(resolved, true);
    const reactFallback = shared['react'] as Record<string, unknown>;
    const routerFallback = shared['next/router'] as Record<string, unknown>;
    const reactDomClient = shared['react-dom/client'] as Record<
      string,
      unknown
    >;

    expect(reactFallback['layer']).toBeUndefined();
    expect(reactFallback['issuerLayer']).toBeUndefined();
    expect(reactFallback['import']).toBe(false);

    expect(routerFallback['layer']).toBeUndefined();
    expect(routerFallback['issuerLayer']).toBeUndefined();
    expect(reactDomClient['singleton']).toBe(true);
  });

  it('browserizes pages shares without forcing eager mode', () => {
    const resolved = normalizeNextFederationOptions({
      name: 'home',
      mode: 'pages',
    });

    const shared = getDefaultShared(resolved, false);
    const reactFallback = shared['react'] as Record<string, unknown>;
    const routerFallback = shared['next/router'] as Record<string, unknown>;

    expect(reactFallback['layer']).toBeUndefined();
    expect(reactFallback['issuerLayer']).toBeUndefined();
    expect(reactFallback['import']).toBeUndefined();
    expect(reactFallback['eager']).toBeUndefined();

    expect(routerFallback['layer']).toBeUndefined();
    expect(routerFallback['issuerLayer']).toBeUndefined();
    expect(routerFallback['import']).toBeUndefined();
    expect(routerFallback['eager']).toBeUndefined();
  });

  it('uses layered app-router aliases on the server compiler', () => {
    const resolved = normalizeNextFederationOptions({
      name: 'app',
      mode: 'app',
      app: {
        enableRsc: true,
      },
    });

    const shared = getDefaultShared(resolved, true);
    const appReactLayer = shared['react-rsc'] as Record<string, unknown>;
    const appReactFallback = shared['react'] as Record<string, unknown>;

    expect(appReactLayer['layer']).toBe('rsc');
    expect(appReactLayer['issuerLayer']).toBe('rsc');
    expect(appReactLayer['request']).toBe(
      'next/dist/server/route-modules/app-page/vendored/rsc/react',
    );

    expect(appReactFallback['request']).toBe('next/dist/compiled/react');
    expect(shared['next/link']).toBeUndefined();
    expect(shared['next/navigation']).toBeUndefined();
  });

  it('keeps app-router layered entries on the browser compiler', () => {
    const resolved = normalizeNextFederationOptions({
      name: 'app',
      mode: 'app',
      app: {
        enableRsc: true,
      },
    });

    const shared = getDefaultShared(resolved, false);
    const appReactLayer = shared['react-rsc'] as Record<string, unknown>;
    const appReactFallback = shared['react'] as Record<string, unknown>;

    expect(appReactLayer['layer']).toBe('rsc');
    expect(appReactLayer['issuerLayer']).toBe('rsc');
    expect(appReactLayer['request']).toBe(
      'next/dist/server/route-modules/app-page/vendored/rsc/react',
    );
    expect(appReactFallback['layer']).toBeUndefined();
    expect(appReactFallback['issuerLayer']).toBeUndefined();
    expect(appReactFallback['request']).toBe('next/dist/compiled/react');
  });
});
