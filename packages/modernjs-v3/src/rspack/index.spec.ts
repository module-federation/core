import { describe, expect, it } from '@rstest/core';
import type { Compiler } from '@rspack/core';
import { BridgeSSRPlugin } from './index';

function select(target: Compiler['options']['target'], request: string) {
  let beforeResolve: ((data: { request: string }) => void) | undefined;
  let definitions: Record<string, unknown> | undefined;
  const compiler = {
    options: { target },
    webpack: {
      DefinePlugin: class {
        constructor(value: Record<string, unknown>) {
          definitions = value;
        }
        apply() {}
      },
    },
    hooks: {
      normalModuleFactory: {
        tap(_name: string, callback: (factory: unknown) => void) {
          callback({
            hooks: {
              beforeResolve: {
                tap(_name: string, callback: typeof beforeResolve) {
                  beforeResolve = callback;
                },
              },
            },
          });
        },
      },
    },
  };
  new BridgeSSRPlugin({ revision: 'producer-build-1' }).apply(
    compiler as unknown as Compiler,
  );
  const data = { request };
  beforeResolve?.(data);
  return { request: data.request, definitions };
}

describe('producer callback target selection', () => {
  it('selects Node callbacks and a provider without ReactDOM client imports', () => {
    for (const target of ['node', 'node18', 'async-node', ['node', 'es2020']]) {
      expect(select(target, '@modern-js/runtime/mf').request).toBe(
        '@modern-js/runtime/mf/server',
      );
      for (const version of ['18', '19']) {
        expect(
          select(target, `@module-federation/modern-js-v3/react-v${version}`)
            .request,
        ).toBe('@module-federation/modern-js-v3/react-server');
        expect(
          select(target, `@module-federation/bridge-react/v${version}`).request,
        ).toBe('@module-federation/modern-js-v3/react-server');
      }
    }
  });

  it('retains browser implementations and compiles the same revision in both targets', () => {
    for (const request of [
      '@modern-js/runtime/mf',
      '@module-federation/bridge-react/v19',
      '@module-federation/modern-js-v3/react-v18',
    ]) {
      expect(select('web', request).request).toBe(request);
    }
    expect(select('web', '@modern-js/runtime/mf').definitions).toEqual(
      select('node', '@modern-js/runtime/mf').definitions,
    );
    expect(select('web', '@modern-js/runtime/mf').definitions).toEqual({
      'process.env.MODERN_BRIDGE_REVISION': JSON.stringify('producer-build-1'),
    });
  });

  it('preserves consumer lifecycle selection and unrelated module resolution', () => {
    expect(
      select('node', '@module-federation/bridge-react/remote-lifecycle')
        .request,
    ).toBe('@module-federation/bridge-react/remote-lifecycle.server');
    expect(
      select('node', '@module-federation/modern-js-v3/bridge/remote').request,
    ).toBe('@module-federation/modern-js-v3/bridge/remote.server');
    expect(select('node', './provider.tsx').request).toBe('./provider.tsx');
  });
});
