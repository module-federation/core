import { optionsParticipant, planComposition } from '../src/composition/plan';

describe('planComposition', () => {
  it('keeps every handler on when no participant carries options', () => {
    expect(
      planComposition([{ kind: 'needs', needs: ['remotes'] }], 'universal'),
    ).toEqual({
      shared: true,
      remote: true,
      snapshot: true,
      adapters: ['remotes', 'share-scope'],
      platform: 'universal',
    });
  });

  it('turns a handler off only when every options participant disables it', () => {
    const plan = planComposition(
      [
        {
          kind: 'options',
          disable: { shared: true, snapshot: true },
          needs: [],
        },
        { kind: 'options', disable: { shared: true }, needs: [] },
        { kind: 'needs', needs: [] },
      ],
      'web',
    );
    expect(plan.shared).toBe(false);
    expect(plan.remote).toBe(true);
    expect(plan.snapshot).toBe(true);
  });

  it('ignores needs participants when voting', () => {
    const plan = planComposition(
      [
        { kind: 'options', disable: { remote: true }, needs: ['container'] },
        { kind: 'needs', needs: ['remotes'] },
      ],
      'node',
    );
    expect(plan.remote).toBe(false);
    expect(plan.adapters).toEqual(['remotes', 'container', 'share-scope']);
  });

  it('drops snapshot when remote is off', () => {
    const plan = planComposition(
      [{ kind: 'options', disable: { remote: true }, needs: [] }],
      'web',
    );
    expect(plan.snapshot).toBe(false);
  });

  it('closes remotes, consumes and container over share-scope in table order', () => {
    expect(
      planComposition(
        [
          {
            kind: 'needs',
            needs: ['container', 'consumes', 'remotes', 'consumes'],
          },
        ],
        'web',
      ).adapters,
    ).toEqual(['remotes', 'consumes', 'container', 'share-scope']);
    expect(planComposition([], 'web').adapters).toEqual([]);
  });
});

describe('optionsParticipant', () => {
  it('maps no options to an options participant that disables and needs nothing', () => {
    expect(optionsParticipant({})).toEqual({
      kind: 'options',
      disable: {},
      needs: [],
    });
  });

  it('reads the disable flags from experiments.optimization', () => {
    expect(
      optionsParticipant({
        experiments: {
          optimization: {
            disableShared: true,
            disableRemote: true,
            disableSnapshot: true,
          },
        },
      }).disable,
    ).toEqual({ shared: true, remote: true, snapshot: true });
    expect(
      optionsParticipant({
        experiments: { optimization: { disableRemote: false } },
      }).disable,
    ).toEqual({});
  });

  it.each([
    [
      'a remotes object',
      { remotes: { app: 'app@/remoteEntry.js' } },
      ['remotes'],
    ],
    ['a remotes array', { remotes: ['app@/remoteEntry.js'] }, ['remotes']],
    ['an empty remotes object', { remotes: {} }, []],
    ['an empty remotes array', { remotes: [] }, []],
    ['a shared object', { shared: { react: {} } }, ['consumes']],
    ['a shared array', { shared: ['react'] }, ['consumes']],
    ['an empty shared object', { shared: {} }, ['consumes']],
    ['an empty shared array', { shared: [] }, ['consumes']],
    ['an exposes object', { exposes: { './A': './a' } }, ['container']],
    ['an exposes array', { exposes: ['./a'] }, ['container']],
    ['an empty exposes object', { exposes: {} }, []],
    ['an empty exposes array', { exposes: [] }, []],
    [
      'remotes, shared and exposes',
      { exposes: { './A': './a' }, shared: ['react'], remotes: ['app'] },
      ['remotes', 'consumes', 'container'],
    ],
  ] as [string, Parameters<typeof optionsParticipant>[0], string[]][])(
    'needs the matching adapters for %s',
    (_, options, needs) => {
      expect(optionsParticipant(options).needs).toEqual(needs);
    },
  );
});
