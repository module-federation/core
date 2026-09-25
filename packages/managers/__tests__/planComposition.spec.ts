import { planComposition } from '../src/composition/plan';

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
