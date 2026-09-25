import { initializeSharing } from '../initializeSharing';
import { installInitialConsumes } from '../installInitialConsumes';

export const shareScope = {
  bundlerRuntime: { I: initializeSharing, installInitialConsumes },
};
