import { remotes as loadRemotes } from '../../remotes';

declare const FEDERATION_OPTIMIZE_NO_REMOTE: boolean;

const useRemote =
  typeof FEDERATION_OPTIMIZE_NO_REMOTE === 'boolean'
    ? !FEDERATION_OPTIMIZE_NO_REMOTE
    : true;

export const remotes = useRemote ? loadRemotes : undefined;
