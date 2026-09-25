import { describe, expect, it } from '@rstest/core';
import { remote } from '@module-federation/runtime-core/remote';
import { web } from '@module-federation/runtime-core/platform/web';
import { init as composeInit } from '../src/compose';
import { init, getInstance } from '../src/index';

describe('public init attaches to a composed instance', () => {
  it('(a) remotes-only instance gains shared through public init, and listeners registered before attach fire', async () => {
    const composed = composeInit(
      { name: 'attach-host' },
      { remote, platform: web },
    );
    expect(composed.sharedHandler.constructor.name).toBe(
      'DisabledSharedHandler',
    );

    const seen: string[] = [];
    composed.sharedHandler.hooks.lifecycle.beforeLoadShare.on((args: any) => {
      seen.push(args.pkgName);
      return args;
    });

    const inst = init({
      name: 'attach-host',
      shared: {
        react: { version: '18.2.0', lib: () => ({ marker: 'react' }) },
      },
    });

    expect(inst).toBe(composed);
    expect(getInstance()).toBe(composed);
    expect(inst.sharedHandler.constructor.name).toBe('SharedHandler');
    const factory = await inst.loadShare<{ marker: string }>('react');
    expect(factory && factory()).toEqual({ marker: 'react' });
    expect(seen).toEqual(['react']);
  });
});
