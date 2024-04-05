import { SEPARATOR } from '@module-federation/sdk';
import { utils } from '@module-federation/managers';

export function getIdentifier(name: string): string {
  return `${name}${SEPARATOR}${utils.getBuildVersion()}`;
}
