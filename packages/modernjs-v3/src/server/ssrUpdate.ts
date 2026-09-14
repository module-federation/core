/** This protocol is owned by the Modern adapter, not the generic MF runtime. */
export interface SSREntryRecord {
  application: string;
  entry: string;
  owner: string;
  rootIds: Array<string | number | null>;
  remoteNames: string[];
  chunks: Array<string | number>;
  reasons: string[];
  runtime: any;
  load(): unknown;
}
export type SSRUpdatePlan = {
  mode: 'entries' | 'application';
  entries?: string[];
  reasons: string[];
};

/**
 * Opt-in contract: all request-side MF consumption uses compiled static imports,
 * entry middleware cannot consume another entry, and mutations use this owner.
 * Dynamic/mixed applications must leave staticOnly disabled.
 */
export function createSSRUpdateAdapter(options: {
  name: string;
  entries: string[];
  staticOnly?: boolean;
}) {
  options = { ...options, entries: [...options.entries] };
  const registry = () =>
    (globalThis as any)[Symbol.for('modern-js.mf.ssr.entries')] as
      | Map<string, SSREntryRecord>
      | undefined;
  const records = () =>
    [...(registry()?.entries() || [])]
      .filter(([, record]) => record.application === options.name)
      .map(([, record]) => record);
  const instances = () => [
    ...new Set(
      [
        ...records().map((record) => record.runtime.federation?.instance),
        ...((globalThis as any).__FEDERATION__?.__INSTANCES__ || []).filter(
          (instance: any) => instance.name === options.name,
        ),
      ].filter(Boolean),
    ),
  ];
  const states = () =>
    instances().map(
      (instance) => instance[Symbol.for('modern-js.mf.ssr.consumption')],
    );
  const registrations = new WeakMap<object, Map<string, any>>();
  const plan = (remote: string): SSRUpdatePlan => {
    const all = records();
    const reasons = new Set<string>();
    if (!options.staticOnly) reasons.add('dynamic-or-mixed-consumption');
    if (!states().length || states().some((state) => !state))
      reasons.add('missing-consumption-tracker');
    if (states().some((state) => state?.dynamic))
      reasons.add('runtime-consumption-observed');
    if (
      !options.entries.length ||
      options.entries.some(
        (entry) => !all.some((record) => record.owner === entry),
      )
    )
      reasons.add('missing-entry-metadata');
    if (all.some((record) => !options.entries.includes(record.owner)))
      reasons.add('unknown-entry-metadata');
    for (const record of all)
      for (const reason of record.reasons) reasons.add(reason);
    const targets = all.filter((record) => record.remoteNames.includes(remote));
    if (!targets.length) reasons.add('remote-not-in-static-graph');
    // Native metadata is required even if compilation found a remote chunk.
    for (const record of targets) {
      const data = record.runtime.remotesLoadingData;
      if (
        !data?.remoteKeyToRemoteModuleIds?.[remote]?.length ||
        !data.remoteModuleIdToConsumerModuleIds ||
        !data.consumerModuleIdToParentModuleIds
      )
        reasons.add('missing-native-invalidation-graph');
      else {
        const queue: Array<string | number> = data.remoteKeyToRemoteModuleIds[
          remote
        ].flatMap(
          (id: string | number) =>
            data.remoteModuleIdToConsumerModuleIds[id] || [],
        );
        const affected = new Set<string>();
        for (let index = 0; index < queue.length; index++) {
          const id = queue[index];
          if (affected.has(String(id))) continue;
          affected.add(String(id));
          queue.push(...(data.consumerModuleIdToParentModuleIds[id] || []));
        }
        if (
          !record.rootIds.every((id) => id !== null && affected.has(String(id)))
        )
          reasons.add('incomplete-parent-closure');
      }
    }
    if (reasons.size) return { mode: 'application', reasons: [...reasons] };
    const owners = new Set(targets.map((record) => record.owner));
    // Entries sharing a bundler runtime share its caches and must drain together.
    let changed = true;
    while (changed) {
      changed = false;
      const runtimes = new Set(
        all
          .filter((record) => owners.has(record.owner))
          .map((record) => record.runtime),
      );
      for (const record of all)
        if (runtimes.has(record.runtime) && !owners.has(record.owner)) {
          owners.add(record.owner);
          changed = true;
        }
    }
    if ([...owners].some((owner) => !options.entries.includes(owner)))
      return { mode: 'application', reasons: ['unknown-runtime-owner'] };
    return { mode: 'entries', entries: [...owners].sort(), reasons: [] };
  };
  type Replacement = { entry: string; type?: string; entryGlobalName?: string };
  type Change = { name: string; replacement: Replacement };
  async function performUpdate(
    application: {
      readonly status?: { phase: string };
      update(
        invalidate: (entries?: readonly string[]) => Promise<void>,
        scope?: () => readonly string[] | undefined,
      ): Promise<number>;
    },
    changes: Change[],
    onMutation: () => void,
  ) {
    let selected: SSRUpdatePlan = { mode: 'application', reasons: [] };
    let recovering = false;
    const token = {};
    const ownedStates = new Set<any>();
    try {
      const execute = () =>
        application.update(
          async (entries) => {
            if (!entries && selected.mode === 'entries') recovering = true;
            if (recovering)
              selected = {
                mode: 'application',
                reasons: ['failed-update-recovery'],
              };
            for (const state of ownedStates) state.selective = Boolean(entries);
            const hosts = instances();
            if (!hosts.length)
              throw new Error('Missing MF application instance');
            const outcomes = await Promise.allSettled(
              hosts.map(async (instance) => {
                const next = changes.map(({ name, replacement }) => {
                  const registered = instance.options.remotes.find(
                    (remote: any) =>
                      remote.name === name || remote.alias === name,
                  );
                  let remembered = registrations.get(instance);
                  if (!remembered) {
                    remembered = new Map();
                    registrations.set(instance, remembered);
                  }
                  const previous = registered ||
                    remembered.get(name) || { name };
                  const target = {
                    ...previous,
                    ...replacement,
                    name: previous.name,
                    alias: previous.alias,
                  };
                  // Retain the intended registration even if mutation removes it.
                  remembered.set(name, target);
                  return target;
                });
                const state =
                  instance[Symbol.for('modern-js.mf.ssr.consumption')];
                const replace = async () => {
                  onMutation();
                  const targets = recovering
                    ? [
                        ...new Map(
                          [
                            ...registrations.get(instance)!.values(),
                            ...next,
                          ].map((remote) => [remote.name, remote]),
                        ).values(),
                      ]
                    : next;
                  await instance.updateRemotes(targets);
                };
                if (state) await state.context.run(token, replace);
                else await replace();
              }),
            );
            const failures = outcomes.filter(
              (result) => result.status === 'rejected',
            );
            if (failures.length)
              throw new AggregateError(
                failures.map((result) => result.reason),
                'SSR remote replacement failed',
              );
          },
          () => {
            const hosts = instances();
            if (!hosts.length)
              throw new Error('Missing MF application instance');
            recovering = application.status?.phase === 'unavailable';
            for (const instance of hosts) {
              const names = changes.map(({ name }) => {
                const existing =
                  instance.options.remotes.find(
                    (remote: any) =>
                      remote.name === name || remote.alias === name,
                  ) || registrations.get(instance)?.get(name);
                if (
                  !existing &&
                  instance.options.remotes.some(
                    (remote: any) =>
                      remote.alias && name.startsWith(remote.alias),
                  )
                )
                  throw new Error(
                    `Remote name conflicts with a registered alias: ${name}`,
                  );
                return existing?.name || name;
              });
              if (new Set(names).size !== names.length)
                throw new Error('Multiple replacements target the same remote');
            }
            const plans = changes.map(({ name }) => plan(name));
            selected = plans.some((item) => item.mode === 'application')
              ? {
                  mode: 'application',
                  reasons: [...new Set(plans.flatMap((item) => item.reasons))],
                }
              : {
                  mode: 'entries',
                  entries: [
                    ...new Set(plans.flatMap((item) => item.entries || [])),
                  ].sort(),
                  reasons: [],
                };
            for (const state of states())
              if (state) {
                state.owner = token;
                state.selective = selected.mode === 'entries';
                ownedStates.add(state);
              }
            return selected.entries;
          },
        );
      const authorized = states()
        .filter(Boolean)
        .reduce<() => Promise<number>>(
          (next, state) => () => state.context.run(token, next),
          execute,
        );
      const generation = await authorized();
      return { ...selected, generation };
    } finally {
      for (const state of ownedStates)
        if (state.owner === token) {
          state.owner = undefined;
          state.selective = false;
        }
    }
  }
  type Application = Parameters<typeof performUpdate>[0];
  type Result = Awaited<ReturnType<typeof performUpdate>> & {
    revision: number;
    appliedRevision: number;
    operationId: string;
  };
  const updates = new WeakMap<
    Application,
    {
      revision: number;
      fingerprint: string;
      operationId: string;
      mutationStarted: boolean;
      phase: 'pending' | 'applied' | 'failed';
      appliedRevision?: number;
      promise: Promise<Result>;
      error?: unknown;
    }
  >();
  let attempt = 0;
  function submit(
    application: Application,
    changes: Change[],
    input?: { revision: number },
  ): Promise<Result> {
    const previous = updates.get(application);
    const revision = input?.revision ?? (previous?.revision ?? 0) + 1;
    if (!Number.isSafeInteger(revision) || revision < 1)
      return Promise.reject(
        new TypeError('revision must be a positive safe integer'),
      );
    if (
      !changes.length ||
      new Set(changes.map((item) => item.name)).size !== changes.length ||
      changes.some(
        ({ name, replacement }) =>
          typeof name !== 'string' ||
          !name ||
          typeof replacement?.entry !== 'string' ||
          !replacement.entry,
      )
    )
      return Promise.reject(
        new TypeError(
          'Unique remote names and replacement entries are required',
        ),
      );
    const captured = changes.map(({ name, replacement }) => ({
      name,
      replacement: { ...replacement },
    }));
    const fingerprint = JSON.stringify(
      captured.map(({ name, replacement }) => [
        name,
        Object.entries(replacement)
          .filter(([, value]) => value !== undefined)
          .sort(([a], [b]) => a.localeCompare(b)),
      ]),
    );
    if (previous) {
      if (revision < previous.revision)
        return Promise.reject(new Error('Stale SSR update revision'));
      if (revision === previous.revision) {
        if (fingerprint !== previous.fingerprint)
          return Promise.reject(
            new Error('SSR revision already has a different replacement'),
          );
        if (previous.phase !== 'failed') return previous.promise;
      }
    }
    const state = {
      revision,
      fingerprint,
      operationId: `${revision}:${++attempt}`,
      mutationStarted: false,
      phase: 'pending' as 'pending' | 'applied' | 'failed',
      appliedRevision: previous?.appliedRevision,
      promise: undefined as unknown as Promise<Result>,
      error: undefined as unknown,
    };
    // The application queue serializes resource publication. Retain only the
    // latest message; older pending completions may advance appliedRevision.
    updates.set(application, state);
    state.promise = performUpdate(application, captured, () => {
      state.mutationStarted = true;
    }).then(
      (result) => {
        state.phase = 'applied';
        const latest = updates.get(application)!;
        latest.appliedRevision = Math.max(
          latest.appliedRevision ?? 0,
          revision,
        );
        return {
          ...result,
          revision,
          appliedRevision: revision,
          operationId: state.operationId,
        };
      },
      (error) => {
        state.phase = 'failed';
        const failure = Object.assign(
          new Error(
            error instanceof Error ? error.message : 'SSR update failed',
            { cause: error },
          ),
          {
            operationId: state.operationId,
            revision,
            appliedRevision: updates.get(application)?.appliedRevision,
            mutationStarted: state.mutationStarted,
            application: application.status,
          },
        );
        state.error = failure;
        throw failure;
      },
    );
    return state.promise;
  }
  return {
    plan,
    status(application: Application) {
      const state = updates.get(application);
      return state
        ? {
            revision: state.revision,
            appliedRevision: state.appliedRevision,
            phase: state.phase,
            error: state.error,
            operationId: state.operationId,
            mutationStarted: state.mutationStarted,
            application: application.status,
          }
        : undefined;
    },
    /** Use an application-wide monotonic revision for external update messages. */
    update(
      application: Application,
      name: string,
      replacement: Replacement,
      input?: { revision: number },
    ): Promise<Result> {
      return submit(application, [{ name, replacement }], input);
    },
    /** One Modern publication for a batch; unknown names are registered. */
    updateRemotes(
      application: Application,
      remotes: Array<Replacement & { name: string }>,
      input?: { revision: number },
    ) {
      return submit(
        application,
        remotes.map(({ name, ...replacement }) => ({ name, replacement })),
        input,
      );
    },
    async reload(entry: string) {
      const record = registry()?.get(JSON.stringify([options.name, entry]));
      if (!record || record.reasons.length || record.rootIds.length !== 1)
        throw new Error(`Missing reloadable SSR entry: ${entry}`);
      // Re-evaluate the invalidated root in its existing runtime, retaining
      // unrelated modules and shared singleton closures.
      return await record.load();
    },
    dispose(entries?: readonly string[]) {
      // Partial updates reuse runtimes. Full rebuilds release their registrations.
      if (entries) return;
      const owned = records();
      const runtimes = new Set(owned.map((record) => record.runtime));
      for (const instance of instances())
        for (const runtime of instance[
          Symbol.for('module-federation.clear-cache.adapters')
        ]?.bindings || [])
          runtimes.add(runtime);
      for (const runtime of runtimes) runtime.federation?.disposeClearCache?.();
      for (const [key, record] of registry() || [])
        if (owned.includes(record)) registry()!.delete(key);
    },
  };
}
