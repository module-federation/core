import {
  resolveRuntimeImplementation,
  expectedEntry,
} from './resolveRuntimeImplementation';
import {
  capabilityDefines,
  conditionsFor,
  hasConfiguredRecord,
  inferRuntimeTarget,
  participantFromOptions,
  participantIntent,
  reduceCapabilityProfile,
} from './capabilityProfile';
import {
  finalizeRuntimeSelection,
  getSelectionSlot,
  inheritRuntimeSelection,
  registerRuntimeParticipant,
  selectionConditionNames,
} from './compilerSlot';
import {
  LEGACY_ALLOWED_REQUESTS,
  LEGACY_DEPENDENCIES,
  LEGACY_PACKAGE_NAMES,
} from './legacyFamily';
import {
  RUNTIME_SELECTION_CONTRACT_VERSION,
  RUNTIME_SELECTION_SLOT,
  RuntimeSelectionError,
  type CapabilityProfile,
  type ParticipantRequest,
  type ResolvedRuntimeImplementation,
  type RuntimeSelectionState,
} from './types';

export {
  capabilityDefines,
  conditionsFor,
  expectedEntry,
  finalizeRuntimeSelection,
  getSelectionSlot,
  hasConfiguredRecord,
  inferRuntimeTarget,
  inheritRuntimeSelection,
  participantFromOptions,
  participantIntent,
  reduceCapabilityProfile,
  registerRuntimeParticipant,
  resolveRuntimeImplementation,
  selectionConditionNames,
  LEGACY_ALLOWED_REQUESTS,
  LEGACY_DEPENDENCIES,
  LEGACY_PACKAGE_NAMES,
  RUNTIME_SELECTION_CONTRACT_VERSION,
  RUNTIME_SELECTION_SLOT,
  RuntimeSelectionError,
};

export type {
  CapabilityProfile,
  ParticipantRequest,
  ResolvedRuntimeImplementation,
  RuntimeSelectionState,
};
