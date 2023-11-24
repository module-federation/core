import type { init } from '@module-federation/runtime';

type ExcludeUndefined<T> = T extends undefined ? never : T;
type NonUndefined<T> = ExcludeUndefined<T>;

type FederationRuntimePlugin = NonUndefined<
  Parameters<typeof init>[0]['plugins']
>[0];

export default function (): FederationRuntimePlugin {
  return {
    name: 'initialize-remote-entry-runtime-plugin',
    beforeLoadShare(args) {
      const { shareInfo, origin } = args;
      if (shareInfo?.scope) {
        shareInfo.scope.forEach((shareScope) => {
          origin.initializeSharing(shareScope);
        });
      }

      return args;
    },
    loadRemoteMatch(args) {
      const { remote, origin } = args;
      origin.initializeSharing(remote.shareScope);
      return args;
    },
  };
}
