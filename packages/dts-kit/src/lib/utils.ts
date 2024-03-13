import { DTSManager } from './DTSManager';

export function getDTSManagerConstructor(
  implementation?: string,
): typeof DTSManager {
  return implementation ? require(implementation) : DTSManager;
}
