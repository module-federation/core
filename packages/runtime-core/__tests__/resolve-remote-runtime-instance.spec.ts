import { describe, it, expect } from '@rstest/core';
import { resolveRemoteRuntimeInstance } from '../src/remote/resolveRemoteRuntimeInstance';
import type { ModuleFederation } from '../src/core';
import type { RemoteInfo } from '../src/type';

const instance = (name: string, version?: string, id = '') =>
  ({ name, options: { id, name, version } }) as unknown as ModuleFederation;

const remoteInfo = (
  name: string,
  extra: Partial<RemoteInfo> = {},
): RemoteInfo => ({
  name,
  entry: 'http://localhost/remoteEntry.js',
  type: 'global',
  entryGlobalName: name,
  shareScope: 'default',
  ...extra,
});

describe('resolveRemoteRuntimeInstance', () => {
  it('matches registered name + buildVersion by composed options.id', () => {
    const target = instance('other', undefined, 'app:1.0.0');
    const res = resolveRemoteRuntimeInstance(
      remoteInfo('app', { buildVersion: '1.0.0' }),
      [instance('app', '2.0.0'), target],
    );
    expect(res.instance).toBe(target);
    expect(res.index).toBe(1);
    expect(res.level).toBe('registeredName+buildVersion');
    expect(res.identity).toEqual({
      registeredName: 'app',
      buildName: 'app',
      buildVersion: '1.0.0',
      instanceId: 'app:1.0.0',
    });
  });

  it('matches registered name + buildVersion by options.name/options.version', () => {
    const target = instance('app', '1.0.0', 'custom-id');
    const res = resolveRemoteRuntimeInstance(
      remoteInfo('app', { buildVersion: '1.0.0' }),
      [target, instance('app', '2.0.0')],
    );
    expect(res.instance).toBe(target);
    expect(res.ambiguous).toBe(false);
  });

  it('falls through to buildName + buildVersion when the alias does not match', () => {
    const target = instance('build', '1.0.0');
    const res = resolveRemoteRuntimeInstance(
      remoteInfo('alias', { entryGlobalName: 'build', buildVersion: '1.0.0' }),
      [instance('alias', '2.0.0'), target],
    );
    expect(res.instance).toBe(target);
    expect(res.level).toBe('buildName+buildVersion');
  });

  it('never degrades a versioned lookup into a name-only match', () => {
    const res = resolveRemoteRuntimeInstance(
      remoteInfo('alias', { entryGlobalName: 'build', buildVersion: '9.9.9' }),
      [instance('alias'), instance('build', '1.0.0')],
    );
    expect(res.instance).toBeUndefined();
    expect(res.index).toBe(-1);
    expect(res.ambiguous).toBe(false);
    expect(res.level).toBeUndefined();
  });

  it('matches registered name alone when no buildVersion is known', () => {
    const target = instance('app');
    const res = resolveRemoteRuntimeInstance(remoteInfo('app'), [
      instance('other'),
      target,
    ]);
    expect(res.instance).toBe(target);
    expect(res.level).toBe('registeredName');
  });

  it('matches entryGlobalName alone only when unambiguous', () => {
    const target = instance('build');
    const ok = resolveRemoteRuntimeInstance(
      remoteInfo('alias', { entryGlobalName: 'build' }),
      [instance('other'), target],
    );
    expect(ok.instance).toBe(target);
    expect(ok.level).toBe('buildName');

    const dup = resolveRemoteRuntimeInstance(
      remoteInfo('alias', { entryGlobalName: 'build' }),
      [instance('build'), instance('build')],
    );
    expect(dup.instance).toBeUndefined();
    expect(dup.ambiguous).toBe(true);
    expect(dup.level).toBe('buildName');
    expect(dup.candidateCount).toBe(2);
  });

  it('reports ambiguity instead of guessing when a level yields several candidates', () => {
    const res = resolveRemoteRuntimeInstance(
      remoteInfo('app', { buildVersion: '1.0.0' }),
      [instance('app', '1.0.0'), instance('app', '1.0.0'), instance('app')],
    );
    expect(res.instance).toBeUndefined();
    expect(res.ambiguous).toBe(true);
    expect(res.level).toBe('registeredName+buildVersion');
    expect(res.candidateCount).toBe(2);
  });

  it('does not use entryGlobalName as a level when it equals the registered name', () => {
    const res = resolveRemoteRuntimeInstance(
      remoteInfo('app', { entryGlobalName: 'app' }),
      [instance('build')],
    );
    expect(res.instance).toBeUndefined();
    expect(res.candidateCount).toBe(0);
  });
});
