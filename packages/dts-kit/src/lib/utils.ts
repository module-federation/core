import { HostOptions } from '../interfaces/HostOptions';
import { DTSManager } from './DTSManager';

export function getDTSManagerConstructor(
  implementation?: string,
): typeof DTSManager {
  return implementation ? require(implementation) : DTSManager;
}
export const validateOptions = (options: HostOptions) => {
  if (!options.moduleFederationConfig) {
    throw new Error('moduleFederationConfig is required');
  }
};
