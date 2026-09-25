import { afterEach, describe, expect, it } from '@rstest/core';
import {
  CurrentGlobal,
  FederationKernel,
} from '@module-federation/runtime-core/kernel';
import { init as composeInit } from '../src/compose';
import { init } from '../src/index';

// An instance with the same name that another bundle on the page registered first.
function registerForeignInstance(name: string) {
  const foreign = new FederationKernel({ name });
  CurrentGlobal.__FEDERATION__.__INSTANCES__.unshift(foreign);
  return foreign;
}

describe('runtime/compose', () => {
  afterEach(() => {
    CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = undefined;
  });

  it('constructs FederationKernel even when a debug constructor is set', () => {
    CurrentGlobal.__FEDERATION__.__DEBUG_CONSTRUCTOR__ = class {
      constructor() {
        throw new Error('debug constructor used');
      }
    } as unknown as typeof FederationKernel;

    const host = composeInit({ name: 'compose-debug' }, {});

    expect(host).toBeInstanceOf(FederationKernel);
    expect(host.options.name).toBe('compose-debug');
  });

  it('does not match a page-global instance by a build-id define', () => {
    (
      globalThis as { FEDERATION_BUILD_IDENTIFIER?: string }
    ).FEDERATION_BUILD_IDENTIFIER = 'foreign:1.0.0';
    const foreign = new FederationKernel({
      name: 'foreign-build',
      id: 'foreign:1.0.0',
    });
    CurrentGlobal.__FEDERATION__.__INSTANCES__.unshift(foreign);
    try {
      expect(init({ name: 'own-build' })).not.toBe(foreign);
    } finally {
      delete (globalThis as { FEDERATION_BUILD_IDENTIFIER?: string })
        .FEDERATION_BUILD_IDENTIFIER;
    }
  });

  it('reuses the bundle-local instance before a page-global match', () => {
    const first = composeInit({ name: 'compose-reuse' }, {});
    const foreign = registerForeignInstance('compose-reuse');

    const second = composeInit({ name: 'compose-reuse' }, {});

    expect(second).toBe(first);
    expect(second).not.toBe(foreign);
  });

  it('shares the bundle-local instance with the public init', () => {
    const first = init({ name: 'shared-current' });
    registerForeignInstance('shared-current');

    expect(composeInit({ name: 'shared-current' }, {})).toBe(first);
    expect(init({ name: 'shared-current' })).toBe(first);
  });
});
