import { assert, describe, it, expect, rs } from '@rstest/core';
import {
  CurrentGlobal,
  setGlobalFederationInstance,
} from '@module-federation/runtime-core';
import { ModuleFederation } from '../src/index';

describe('ModuleFederation', () => {
  it('registers new remotes and loads them correctly', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });

    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');
    // Register new remotes
    FM.registerRemotes([
      {
        name: '@register-remotes/app2',
        entry:
          'http://localhost:1111/resources/register-remotes/app2/federation-remote-entry.js',
      },
    ]);
    const app2Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app2/say',
    );
    assert(app2Module);
    const res = await app2Module();
    expect(res).toBe('hello app2');
  });
  it('does not merge loaded remote by default', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    FM.registerRemotes([
      {
        name: '@register-remotes/app1',
        // Entry is different from the registered remote
        entry:
          'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
      },
    ]);

    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');
  });
  it('merges loaded remote by setting "force: true"', async () => {
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    const app1Res = await app1Module();
    expect(app1Res).toBe('hello app1 entry1');

    FM.registerRemotes(
      [
        {
          name: '@register-remotes/app1',
          // Entry is different from the registered remote
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
        },
      ],
      { force: true },
    );
    const newApp1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(newApp1Module);
    const newApp1Res = await newApp1Module();
    // Value is different from the registered remote
    expect(newApp1Res).toBe('hello app1 entry2');
  });
  it('removes the remote runtime instance matched by entryGlobalName when force registering', async () => {
    const buildName = '@register-remotes/app1';
    const registeredName = '@register-remotes/app1-alias';
    // Drop any container global left behind by earlier tests so the entry
    // script is executed again instead of being reused.
    delete (CurrentGlobal as Record<string, unknown>)[buildName];
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          // Registered name differs from the name the remote was built with
          name: registeredName,
          entryGlobalName: buildName,
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    const app1Module = await FM.loadRemote<Promise<() => string>>(
      `${registeredName}/say`,
    );
    assert(app1Module);
    expect(await app1Module()).toBe('hello app1 entry1');

    // Simulate the remote's own runtime instance, named after its build name
    const remoteInstance = new ModuleFederation({
      name: buildName,
      remotes: [],
    });
    setGlobalFederationInstance(remoteInstance);
    expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toContain(
      remoteInstance,
    );
    const warnSpy = rs.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      FM.registerRemotes(
        [
          {
            name: registeredName,
            entryGlobalName: buildName,
            entry:
              'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
          },
        ],
        { force: true },
      );

      expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).not.toContain(
        remoteInstance,
      );
      expect(FM.moduleCache.has(registeredName)).toBe(false);
      expect(
        warnSpy.mock.calls.some((call) =>
          call.some(
            (arg) =>
              typeof arg === 'string' &&
              arg.includes('__FEDERATION__.__INSTANCES__'),
          ),
        ),
      ).toBe(false);
    } finally {
      warnSpy.mockRestore();
    }

    const newApp1Module = await FM.loadRemote<Promise<() => string>>(
      `${registeredName}/say`,
    );
    assert(newApp1Module);
    expect(await newApp1Module()).toBe('hello app1 entry2');
  });
  it('warns and keeps __INSTANCES__ unchanged when no runtime instance matches the removed remote', async () => {
    delete (CurrentGlobal as Record<string, unknown>)['@register-remotes/app1'];
    const FM = new ModuleFederation({
      name: '@federation/instance',
      version: '1.0.1',
      remotes: [
        {
          name: '@register-remotes/app1',
          entry:
            'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry.js',
        },
      ],
    });
    const app1Module = await FM.loadRemote<Promise<() => string>>(
      '@register-remotes/app1/say',
    );
    assert(app1Module);
    expect(await app1Module()).toBe('hello app1 entry1');

    const unrelatedInstance = new ModuleFederation({
      name: '@register-remotes/unrelated',
      remotes: [],
    });
    setGlobalFederationInstance(unrelatedInstance);
    const instancesBefore = [...CurrentGlobal.__FEDERATION__.__INSTANCES__];
    const warnSpy = rs.spyOn(console, 'warn').mockImplementation(() => {});

    try {
      FM.registerRemotes(
        [
          {
            name: '@register-remotes/app1',
            entry:
              'http://localhost:1111/resources/register-remotes/app1/federation-remote-entry2.js',
          },
        ],
        { force: true },
      );

      expect(CurrentGlobal.__FEDERATION__.__INSTANCES__).toEqual(
        instancesBefore,
      );
      const warning = warnSpy.mock.calls
        .flat()
        .find(
          (arg) =>
            typeof arg === 'string' &&
            arg.includes('__FEDERATION__.__INSTANCES__'),
        );
      expect(warning).toBeDefined();
      expect(warning).toContain('"@register-remotes/app1"');
      expect(warning).toContain(
        'share scope and instance could not be released',
      );
    } finally {
      warnSpy.mockRestore();
    }
  });
});
