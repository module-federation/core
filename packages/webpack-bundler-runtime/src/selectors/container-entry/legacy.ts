import { initContainerEntry as loadContainerEntry } from '../../initContainerEntry';

declare const FEDERATION_HAS_EXPOSES: boolean;

const includeContainerEntry =
  typeof FEDERATION_HAS_EXPOSES === 'boolean' ? FEDERATION_HAS_EXPOSES : true;

export const initContainerEntry = includeContainerEntry
  ? loadContainerEntry
  : undefined;
