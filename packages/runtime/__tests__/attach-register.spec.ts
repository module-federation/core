import { describe, expect, it } from '@rstest/core';
import { shared } from '@module-federation/runtime-core/shared';
import { init as composeInit } from '../src/compose';
import { getInstance, registerRemotes } from '../src/index';

describe('registerRemotes on an instance composed without remote', () => {
  it('(d) the instance method throws the named error; the public function attaches remote first', () => {
    const composed = composeInit({ name: 'no-remote-host' }, { shared });
    const late = [{ name: 'late', entry: 'http://localhost:1111/late.js' }];

    expect(() => getInstance()!.registerRemotes(late)).toThrow(
      '@module-federation/runtime-core/remote',
    );

    registerRemotes(late);
    expect(composed.remoteHandler.constructor.name).toBe('RemoteHandler');
    expect(composed.options.remotes.map((r) => r.name)).toEqual(['late']);
  });
});
