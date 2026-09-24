import type {
  CapabilityIntent,
  CapabilityName,
  CapabilityProfile,
  ParticipantRequest,
  RuntimeTarget,
} from './types';
import { isRecord, RuntimeSelectionError } from './types';

export interface ParticipantIntent {
  remote: CapabilityIntent;
  shared: CapabilityIntent;
  snapshotPlugins: CapabilityIntent;
  containerEntry: CapabilityIntent;
  explicitTarget: Exclude<RuntimeTarget, 'universal'> | null;
  externalCore: boolean;
}

export function hasConfiguredRecord(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return isRecord(value) && Object.keys(value).length > 0;
}

function intent(forbidden: boolean, required: boolean): CapabilityIntent {
  if (forbidden) {
    return 'forbidden';
  }
  if (required) {
    return 'required';
  }
  return 'neutral';
}

export function participantFromOptions(
  pluginName: string,
  options: Omit<ParticipantRequest, 'pluginName'>,
): ParticipantRequest {
  return {
    pluginName,
    ...options,
  };
}

export function participantIntent(
  request: ParticipantRequest,
): ParticipantIntent {
  const optimization = request.experiments?.optimization ?? {};
  return {
    remote: intent(
      optimization.disableRemote === true,
      hasConfiguredRecord(request.remotes),
    ),
    shared: intent(
      optimization.disableShared === true,
      hasConfiguredRecord(request.shared),
    ),
    snapshotPlugins: intent(optimization.disableSnapshot === true, false),
    containerEntry: hasConfiguredRecord(request.exposes)
      ? 'required'
      : 'neutral',
    explicitTarget: normalizeExplicitTarget(optimization.target),
    externalCore: request.experiments?.externalRuntime === true,
  };
}

function normalizeExplicitTarget(
  target: unknown,
): Exclude<RuntimeTarget, 'universal'> | null {
  return target === 'web' || target === 'node' || target === 'worker'
    ? target
    : null;
}

function reduceIntent(
  capability: CapabilityName,
  intents: readonly CapabilityIntent[],
): CapabilityIntent {
  const required = intents.some((intentValue) => intentValue === 'required');
  const forbidden = intents.some((intentValue) => intentValue === 'forbidden');
  if (required && forbidden) {
    throw new RuntimeSelectionError(
      'capability-conflict',
      `Federation participants disagree on ${capability}.`,
    );
  }
  if (forbidden) {
    return 'forbidden';
  }
  if (required) {
    return 'required';
  }
  return 'neutral';
}

export function inferRuntimeTarget(
  compilerTarget: string | readonly string[] | false | undefined,
): RuntimeTarget {
  const values = Array.isArray(compilerTarget)
    ? compilerTarget
    : compilerTarget
      ? [compilerTarget]
      : [];
  const flags = { web: false, node: false, worker: false };
  for (const value of values) {
    if (/worker/.test(value)) {
      flags.worker = true;
      continue;
    }
    if (/electron|nwjs/.test(value)) {
      flags.web = true;
      flags.node = true;
      continue;
    }
    if (/node/.test(value)) {
      flags.node = true;
      continue;
    }
    if (/web|browser/.test(value)) {
      flags.web = true;
    }
  }
  const matches = [flags.web, flags.node, flags.worker].filter(Boolean).length;
  if (matches !== 1) {
    return 'universal';
  }
  if (flags.worker) {
    return 'worker';
  }
  if (flags.node) {
    return 'node';
  }
  return 'web';
}

export function reduceCapabilityProfile(
  requests: readonly ParticipantRequest[],
  compilerTarget?: string | readonly string[] | false,
): CapabilityProfile {
  const intents = requests.map(participantIntent);
  const explicitTargets = new Set(
    intents
      .map((item) => item.explicitTarget)
      .filter(
        (target): target is Exclude<RuntimeTarget, 'universal'> =>
          target !== null,
      ),
  );
  if (explicitTargets.size > 1) {
    throw new RuntimeSelectionError(
      'target-conflict',
      `Federation participants request different runtime targets: ${[...explicitTargets].join(', ')}.`,
    );
  }
  const externalValues = new Set(intents.map((item) => item.externalCore));
  if (externalValues.size > 1) {
    throw new RuntimeSelectionError(
      'external-conflict',
      'Federation participants disagree on externalRuntime.',
    );
  }
  const explicitTarget = [...explicitTargets][0] ?? null;
  return {
    remote: reduceIntent(
      'remote',
      intents.map((item) => item.remote),
    ),
    shared: reduceIntent(
      'shared',
      intents.map((item) => item.shared),
    ),
    snapshotPlugins: reduceIntent(
      'snapshotPlugins',
      intents.map((item) => item.snapshotPlugins),
    ),
    containerEntry: reduceIntent(
      'containerEntry',
      intents.map((item) => item.containerEntry),
    ),
    explicitTarget,
    target: explicitTarget ?? inferRuntimeTarget(compilerTarget),
    externalMode: externalValues.has(true) ? 'external-core' : 'bundled',
  };
}

export function conditionsFor(profile: CapabilityProfile): string[] {
  const conditions = [
    profile.remote === 'forbidden' ? 'module-federation:no-remote' : undefined,
    profile.shared === 'forbidden' ? 'module-federation:no-shared' : undefined,
    profile.snapshotPlugins === 'forbidden'
      ? 'module-federation:no-snapshot-plugins'
      : undefined,
    profile.containerEntry === 'required'
      ? undefined
      : 'module-federation:no-container-entry',
    `module-federation:target-${profile.target}`,
  ];
  return conditions.filter((condition): condition is string =>
    Boolean(condition),
  );
}

export function capabilityDefines(
  profile: CapabilityProfile,
): Record<string, string | boolean> {
  const defines: Record<string, string | boolean> = {
    FEDERATION_OPTIMIZE_NO_REMOTE: profile.remote === 'forbidden',
    FEDERATION_OPTIMIZE_NO_SHARED: profile.shared === 'forbidden',
    FEDERATION_OPTIMIZE_NO_SNAPSHOT_PLUGIN:
      profile.snapshotPlugins === 'forbidden',
    FEDERATION_HAS_EXPOSES: profile.containerEntry === 'required',
  };
  if (profile.explicitTarget === 'web' || profile.explicitTarget === 'node') {
    defines['ENV_TARGET'] = JSON.stringify(profile.explicitTarget);
  }
  return defines;
}
