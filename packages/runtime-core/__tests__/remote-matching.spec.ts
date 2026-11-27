import { describe, expect, it } from '@rstest/core';
import { matchRemoteWithNameAndExpose } from '../src/utils/manifest';
import type { Remote } from '../src/type';

describe('remote request matching', () => {
  const remote: Remote = {
    name: '@scope/app',
    alias: 'app/utils',
    entry: 'https://example.test/remoteEntry.js',
  };

  it.each([
    ['@scope/app', '@scope/app', '.'],
    ['@scope/app/Button', '@scope/app', './Button'],
    ['@scope/app/nested/@scope/app', '@scope/app', './nested/@scope/app'],
    ['app/utils', 'app/utils', '.'],
    ['app/utils/sort', 'app/utils', './sort'],
    ['app/utils//sort', 'app/utils', './/sort'],
  ])('matches %s without changing the expose', (id, pkgNameOrAlias, expose) => {
    expect(matchRemoteWithNameAndExpose([remote], id)).toEqual({
      pkgNameOrAlias,
      expose,
      remote,
    });
  });

  it.each([
    '@scope/application',
    'app/utils-extra/sort',
    'prefix/@scope/app/Button',
    '',
  ])('does not match a partial prefix: %s', (id) => {
    expect(matchRemoteWithNameAndExpose([remote], id)).toBeUndefined();
  });

  it('preserves registration order even when a later name is more specific', () => {
    const nested = { ...remote, name: '@scope/app/nested', alias: undefined };
    expect(
      matchRemoteWithNameAndExpose(
        [remote, nested],
        '@scope/app/nested/Button',
      ),
    ).toEqual({
      pkgNameOrAlias: remote.name,
      expose: './nested/Button',
      remote,
    });
    expect(
      matchRemoteWithNameAndExpose([nested, remote], '@scope/app/nested/Button')
        ?.remote,
    ).toBe(nested);
  });

  it('observes list replacement, reordering and in-place name or alias updates', () => {
    const first = { ...remote };
    const second = { ...remote, name: 'second', alias: 'second-alias' };
    const remotes = [first, second];
    expect(matchRemoteWithNameAndExpose(remotes, 'app/utils')?.remote).toBe(
      first,
    );
    first.alias = 'renamed';
    first.name = 'renamed-name';
    expect(matchRemoteWithNameAndExpose(remotes, 'app/utils')).toBeUndefined();
    expect(matchRemoteWithNameAndExpose(remotes, 'renamed')?.remote).toBe(
      first,
    );
    remotes[0] = { ...first, entry: 'https://replacement.test/entry.js' };
    expect(matchRemoteWithNameAndExpose(remotes, 'renamed')?.remote).toBe(
      remotes[0],
    );
    second.alias = 'renamed';
    remotes.reverse();
    expect(matchRemoteWithNameAndExpose(remotes, 'renamed')?.remote).toBe(
      second,
    );
  });

  it('does not read the alias when the name has already matched', () => {
    const withAliasGetter = {
      name: 'app',
      entry: remote.entry,
      get alias(): string {
        throw new Error('alias must not be read');
      },
    };
    expect(matchRemoteWithNameAndExpose([withAliasGetter], 'app')?.expose).toBe(
      '.',
    );
  });
});
