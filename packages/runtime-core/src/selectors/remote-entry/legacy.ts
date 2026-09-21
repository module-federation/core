import { getRemoteEntry as loadRemoteEntry } from '../../utils/load';
import { getRemoteEntry as rejectRemoteEntry } from './disabled';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;

const useRemote =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_REMOTE
    : true;

export const getRemoteEntry = useRemote ? loadRemoteEntry : rejectRemoteEntry;
