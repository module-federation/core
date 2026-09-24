import { conditionsFor, reduceCapabilityProfile } from './capabilityProfile';
import { resolveRuntimeImplementation } from './resolveRuntimeImplementation';
import {
  RUNTIME_SELECTION_SLOT,
  RuntimeSelectionError,
  type CapabilityProfile,
  type ParticipantRequest,
  type ResolvedRuntimeImplementation,
} from './types';

export interface SelectionSlot {
  participants: ParticipantRequest[];
  finalized: boolean;
  installed: boolean;
  image?: ResolvedRuntimeImplementation;
  profile?: CapabilityProfile;
}

export function getSelectionSlot(compiler: object): SelectionSlot {
  const record = compiler as Record<symbol, SelectionSlot | undefined>;
  const existing = record[RUNTIME_SELECTION_SLOT];
  if (existing) {
    return existing;
  }
  const created: SelectionSlot = {
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
