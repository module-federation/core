import { conditionsFor, reduceCapabilityProfile } from './capabilityProfile';
import { resolveRuntimeImplementation } from './resolveRuntimeImplementation';
import {
  RUNTIME_SELECTION_SLOT,
  RUNTIME_SELECTION_CONTRACT_VERSION,
  isRecord,
  MEMBER_ROLES,
  RuntimeSelectionError,
  type CapabilityProfile,
  type ParticipantRequest,
  type ResolvedRuntimeImplementation,
} from './types';

export interface SelectionSlot {
  version: 1;
  participants: ParticipantRequest[];
  finalized: boolean;
  installed: boolean;
  image?: ResolvedRuntimeImplementation;
  profile?: CapabilityProfile;
}

function isSelectedImage(
  value: unknown,
): value is ResolvedRuntimeImplementation {
  if (!isRecord(value)) return false;
  const family = value['family'];
  if (!isRecord(family) || !isRecord(family['members'])) return false;
  const members = family['members'];
  return (
    ['anchor', 'facadeEntry', 'entryLoadingIdentity'].every(
      (key) => typeof value[key] === 'string',
    ) &&
    (value['mode'] === 'conditions' || value['mode'] === 'legacy-defines') &&
    (value['externalMode'] === 'bundled' ||
      value['externalMode'] === 'external-core') &&
    typeof family['instanceId'] === 'string' &&
    typeof family['compatibilityId'] === 'string' &&
    MEMBER_ROLES.every((role) => {
      const member = members[role];
      return (
        isRecord(member) &&
        member['role'] === role &&
        [
          'packageName',
          'version',
          'canonicalRoot',
          'entry',
          'packageJsonPath',
        ].every((key) => typeof member[key] === 'string')
      );
    }) &&
    isRecord(value['allowedEntries']) &&
    Object.values(value['allowedEntries']).every(
      (entry) => typeof entry === 'string',
    ) &&
    isRecord(value['allowedRequests']) &&
    Object.values(value['allowedRequests']).every(
      (request) =>
        isRecord(request) &&
        MEMBER_ROLES.some((role) => role === request['role']) &&
        typeof request['exportName'] === 'string',
    ) &&
    isRecord(value['selectors']) &&
    Object.values(value['selectors']).every((selector) => {
      if (!isRecord(selector) || !isRecord(selector['leaves'])) return false;
      const leaves = selector['leaves'];
      return (
        MEMBER_ROLES.some((role) => role === selector['ownerRole']) &&
        (selector['disabledCondition'] === undefined ||
          typeof selector['disabledCondition'] === 'string') &&
        ['enabled', 'disabled', 'legacy'].every(
          (leaf) => typeof leaves[leaf] === 'string',
        )
      );
    })
  );
}

function isSelectedProfile(value: unknown): value is CapabilityProfile {
  return (
    isRecord(value) &&
    ['remote', 'shared', 'snapshotPlugins', 'containerEntry'].every(
      (capability) =>
        ['neutral', 'required', 'forbidden'].some(
          (intent) => intent === value[capability],
        ),
    ) &&
    (value['explicitTarget'] === null ||
      ['web', 'node', 'worker'].some(
        (target) => target === value['explicitTarget'],
      )) &&
    ['web', 'node', 'worker', 'universal'].some(
      (target) => target === value['target'],
    ) &&
    (value['externalMode'] === 'bundled' ||
      value['externalMode'] === 'external-core')
  );
}

function isSelectionSlot(value: unknown): value is SelectionSlot {
  return (
    isRecord(value) &&
    value['version'] === RUNTIME_SELECTION_CONTRACT_VERSION &&
    Array.isArray(value['participants']) &&
    value['participants'].every(
      (participant) =>
        isRecord(participant) && typeof participant['pluginName'] === 'string',
    ) &&
    typeof value['finalized'] === 'boolean' &&
    typeof value['installed'] === 'boolean' &&
    (!value['finalized'] ||
      (isSelectedImage(value['image']) && isSelectedProfile(value['profile'])))
  );
}

export function getSelectionSlot(compiler: object): SelectionSlot {
  const record = compiler as Record<symbol, unknown>;
  const existing = record[RUNTIME_SELECTION_SLOT];
  if (existing !== undefined) {
    if (!isSelectionSlot(existing)) {
      throw new RuntimeSelectionError(
        'invalid-selection-slot',
        'Compiler runtime selection slot has an unsupported version or malformed state.',
      );
    }
    return existing;
  }
  const created: SelectionSlot = {
    version: RUNTIME_SELECTION_CONTRACT_VERSION,
    participants: [],
    finalized: false,
    installed: false,
  };
  record[RUNTIME_SELECTION_SLOT] = created;
  return created;
}

export function registerRuntimeParticipant(
  compiler: object,
  request: ParticipantRequest,
): void {
  const slot = getSelectionSlot(compiler);
  if (slot.finalized) {
    throw new RuntimeSelectionError(
      'late-participant',
      `${request.pluginName} registered after runtime selection was finalized.`,
    );
  }
  slot.participants.push(request);
}

export function finalizeRuntimeSelection(
  compiler: object,
  compilerTarget: string | readonly string[] | false | undefined,
  anchor: string,
): SelectionSlot {
  const slot = getSelectionSlot(compiler);
  if (slot.finalized && slot.image && slot.profile) {
    return slot;
  }

  const implementations = [
    ...new Set(
      slot.participants
        .map((participant) => participant.implementation)
        .filter((implementation): implementation is string =>
          Boolean(implementation),
        ),
    ),
  ];
  const first = implementations[0] ?? anchor;
  const image = resolveRuntimeImplementation(first);
  for (const implementation of implementations.slice(1)) {
    const next = resolveRuntimeImplementation(implementation);
    if (next.family.instanceId !== image.family.instanceId) {
      throw new RuntimeSelectionError(
        'split-family',
        `Federation participants request different runtime families: ${first} (${image.anchor}) and ${implementation} (${next.anchor}).`,
      );
    }
  }

  slot.image = image;
  slot.profile = reduceCapabilityProfile(slot.participants, compilerTarget);
  slot.finalized = true;
  return slot;
}

export function inheritRuntimeSelection(parent: object, child: object): void {
  const source = getSelectionSlot(parent);
  const target = getSelectionSlot(child);
  if (target.participants.length > 0) {
    throw new RuntimeSelectionError(
      'child-participant',
      `${target.participants[0].pluginName} was applied to a child compiler. Apply federation plugins to the top-level compiler.`,
    );
  }
  target.participants = [...source.participants];
  target.finalized = source.finalized;
  target.installed = true;
  target.image = source.image;
  target.profile = source.profile;
}

export function selectionConditionNames(profile: CapabilityProfile): string[] {
  return [...conditionsFor(profile), '...'];
}
