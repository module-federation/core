export const ADAPTERS = [
  'remotes',
  'consumes',
  'container',
  'share-scope',
] as const;
export type AdapterName = (typeof ADAPTERS)[number];

const ADAPTER_REQUIRES: Record<AdapterName, readonly AdapterName[]> = {
  remotes: ['share-scope'],
  consumes: ['share-scope'],
  container: ['share-scope'],
  'share-scope': [],
};

export type CompositionPlatform = 'web' | 'node' | 'universal';

type Handler = 'shared' | 'remote' | 'snapshot';

export type Participant =
  | {
      kind: 'options';
      disable: { [K in Handler]?: true };
      needs: readonly AdapterName[];
    }
  | { kind: 'needs'; needs: readonly AdapterName[] };

export interface CompositionPlan {
  shared: boolean;
  remote: boolean;
  snapshot: boolean;
  adapters: AdapterName[];
  platform: CompositionPlatform;
}

export function planComposition(
  participants: readonly Participant[],
  platform: CompositionPlatform,
): CompositionPlan {
  const voters = participants.filter((p) => p.kind === 'options');
  const off = (handler: Handler) =>
    voters.length > 0 && voters.every((p) => p.disable[handler]);

  const needed = new Set<AdapterName>();
  const add = (name: AdapterName) => {
    if (needed.has(name)) return;
    needed.add(name);
    ADAPTER_REQUIRES[name].forEach(add);
  };
  participants.forEach((p) => p.needs.forEach(add));

  return {
    shared: !off('shared'),
    remote: !off('remote'),
    snapshot: !off('remote') && !off('snapshot'),
    adapters: ADAPTERS.filter((name) => needed.has(name)),
    platform,
  };
}
