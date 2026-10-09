import { initializeSharing } from '../initializeSharing';
import { installInitialConsumes } from '../installInitialConsumes';
import type { Adapter } from '../types';

export const shareScope: Adapter = {
  bundlerRuntime: { I: initializeSharing, installInitialConsumes },
};
