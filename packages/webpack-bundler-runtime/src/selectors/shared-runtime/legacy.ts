import { consumes as loadConsumes } from '../../consumes';
import { getSharedFallbackGetter as loadSharedFallbackGetter } from '../../getSharedFallbackGetter';
import { initializeSharing as loadInitializeSharing } from '../../initializeSharing';
import { installInitialConsumes as loadInstallInitialConsumes } from '../../installInitialConsumes';

declare const FEDERATION_OPTIMIZE_NO_SHARED: boolean;

const useShared =
  typeof FEDERATION_OPTIMIZE_NO_SHARED === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_SHARED
    : true;

export const consumes = useShared ? loadConsumes : undefined;
export const initializeSharing = useShared ? loadInitializeSharing : undefined;
export const installInitialConsumes = useShared
  ? loadInstallInitialConsumes
  : undefined;
export const getSharedFallbackGetter = useShared
  ? loadSharedFallbackGetter
  : undefined;
